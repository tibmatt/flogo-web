import { inject, injectable } from 'inversify';
import { defaults, escapeRegExp, fromPairs, isEqual, pick } from 'lodash';
import shortid from 'shortid';

import { EXPORT_MODE, REF_TRIGGER_LAMBDA } from '../../common/constants';
import { normalizeName } from '../exporter/utils/normalize-name';

import { Database } from '../../common/database.service';
import { ErrorManager, ERROR_TYPES as GENERAL_ERROR_TYPES } from '../../common/errors';
import { Logger } from '../../common/logging';
import { findGreatestNameIndex } from '../../common/utils/collection';
import { CONSTRAINTS } from '../../common/validation';
import { TOKENS } from '../../core';
import { exportApplication } from '../exporter';
import { buildBinary, buildPlugin } from './build';
import { Validator } from './validator';
import { AppTriggersService } from './triggers';

const EDITABLE_FIELDS = ['name', 'version', 'description'];
const PUBLISH_FIELDS = [
  'id',
  'name',
  'type',
  'version',
  'description',
  'properties',
  'version',
  'createdAt',
  'updatedAt',
  'triggers',
  'actions',
];

@injectable()
export class AppsService {
  constructor(
    @inject(TOKENS.AppsDb) private appsDb: Database,
    @inject(TOKENS.Logger) private logger: Logger,
    @inject(TOKENS.ActionsManager) private actionsManager,
    private triggersService: AppTriggersService
  ) {}

  create(app) {
    let inputData = app;
    const errors = Validator.validateSimpleApp(inputData);
    if (errors) {
      return Promise.reject(
        ErrorManager.createValidationError('Validation error', errors)
      );
    }
    inputData._id = shortid.generate();
    inputData.name = inputData.name.trim();
    inputData = appDefaults(inputData);
    return this.appsDb
      .insert(inputData)
      .catch(error => {
        if (error.errorType === 'uniqueViolated') {
          this.logger.debug(
            `Name ${inputData.name} already exists, will create new name`
          );
          return ensureUniqueName(inputData.name, this.appsDb).then(name => {
            this.logger.debug(`Will use ${name}`);
            inputData.name = name;
            return this.appsDb.insert(inputData);
          });
        }
        return Promise.reject(error);
      })
      .then(newApp => cleanForOutput(newApp));
  }

  /**
   *
   * @param appId if not provided will try to use app.id
   * @param newData {object}
   */
  update(appId, newData) {
    const inputData = cleanInput(newData);
    return (
      this.appsDb
        // fetch editable fields only
        .findOne(
          { _id: appId },
          fromPairs(EDITABLE_FIELDS.concat('_id').map(field => [field, 1]))
        )
        .then(app => {
          if (!app) {
            throw ErrorManager.makeError('App not found', {
              type: GENERAL_ERROR_TYPES.COMMON.NOT_FOUND,
            });
          }

          const mergedData = Object.assign({}, app, inputData);
          if (isEqual(mergedData, app)) {
            // no changes, we don't need to update anything
            return false;
          }

          const errors = Validator.validateSimpleApp(mergedData);
          if (errors) {
            throw ErrorManager.createValidationError('Validation error', {
              details: errors,
            });
          }
          if (inputData.name) {
            inputData.name = inputData.name.trim();
            return validateUniqueName(inputData.name);
          }
          return true;
        })
        .then(shouldUpdate => {
          if (shouldUpdate) {
            delete inputData._id;
            return this.appsDb.update(
              { _id: appId },
              { $set: Object.assign({ updatedAt: nowISO() }, inputData) }
            );
          }
          return null;
        })
        .then(() => this.findOne(appId, { withFlows: true }))
    );

    function validateUniqueName(inputName) {
      const name = getAppNameForSearch(inputName);
      return this.appsDb
        .findOne(
          { _id: { $ne: appId }, name: new RegExp(`^${name}$`, 'i') },
          { _id: 1, name: 1 }
        )
        .then(nameExists => {
          if (nameExists) {
            throw ErrorManager.createValidationError('Validation error', [
              {
                property: 'name',
                title: 'Name already exists',
                detail: "There's another app with that name",
                value: inputName,
                type: CONSTRAINTS.UNIQUE,
              },
            ]);
          }
          return true;
        });
    }
  }

  /**
   * Delete an app.
   * Will also delete related flows
   * @param appId {string} appId
   */
  async remove(appId) {
    const numRemoved = await this.appsDb.remove({ _id: appId });
    const wasRemoved = numRemoved > 0;
    if (wasRemoved) {
      await this.actionsManager.removeFromRecentByAppId(appId);
    }
    return wasRemoved;
  }

  /**
   * List or find all apps
   *
   * ## searchTerms
   * - name {string} find by name with exactly this name (case insensitive)
   *
   * ## options
   * - withFlows {boolean|string} get also all the related flows. Possible values:
   *    - short {string} - get short version of the flows
   *    - full {string} -  get full version of the flows
   *    - true {boolean} - same as 'short'
   *    - false {boolean} - do not get the flows
   *
   * @param terms
   * @params terms.name {string} name of the app
   * @params options
   * @params options.withFlows: retrieveFlows
   */
  find(terms: { name?: string | RegExp } = {}, { withFlows } = { withFlows: false }) {
    if (terms.name) {
      const name = getAppNameForSearch(terms.name);
      terms.name = new RegExp(`^${name}$`, 'i');
    }

    return this.appsDb.find(terms).then(apps => apps.map(cleanForOutput));
  }

  /**
   *
   * Options:
   *    * ## options
   *    - withFlows {boolean|string} get also all the related flows. Possible values:
   *      - short {string} - get short version of the flows
   *      - full {string} -  get full version of the flows
   *      - true {boolean} - same as 'short'
   *      - false {boolean} - do not get the flows
   * @param appId
   * @param options
   * @param options.withFlows retrieve flows
   */
  findOne(appId, { withFlows }: { withFlows: string | boolean } = { withFlows: false }) {
    return this.appsDb
      .findOne({ _id: appId })
      .then(app => (app ? cleanForOutput(app) : null));
  }

  /**
   * Builds an app binary and returns the generated binary
   * @param appId {string} app to build
   * @params options
   * @params options.compile.os: target operating system
   * @params options.compile.arch: target architecture
   * @params options.shimTriggerId: create an app using shim mode using specified trigger id
   * @return {object} built app stream
   * @throws Not found error if app not found
   */
  async build(appId, options) {
    return buildBinary(() => this.export(appId), options);
  }

  /**
   * Builds an app in shim mode and returns the generated file
   * @param triggerId {string} trigger to build
   * @params options
   * @params options.compile.os: target operating system
   * @params options.compile.arch: target architecture
   * @params options.shimTriggerId: create an app using shim mode using specified trigger id
   * @return {{ trigger: string, appName: string, data: Stream }} built handler zip file
   * @throws Not found error if trigger not found
   */
  async buildShim(triggerId, options) {
    const trigger = await this.triggersService.findOne(triggerId);
    if (!trigger) {
      throw ErrorManager.makeError('Cannot build shim for unknown trigger id', {
        type: GENERAL_ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }
    const build = trigger.ref === REF_TRIGGER_LAMBDA ? buildPlugin : buildBinary;
    return build(() => this.export(trigger.appId), {
      ...options,
      shimTriggerId: normalizeName(trigger.name),
    });
  }

  /**
   * Export an app to the schema expected by cli
   * This will export apps and flows
   * @param {string} appId - app to export
   * @param {object} [options]
   * @param {string} [options.appModel] - type of export if it is an application export or a flows only export
   * @param {string} [options.format] - type of export if it is an application export or a flows only export
   * @param {string[]} [options.flowIds] - Array of flow Id's which are to be exported in case of flows only export
   * @return {object} exported object
   * @throws Not found error if app not found
   */
  export(
    appId,
    { format, flowIds }: { appModel?: string; format?: string; flowIds?: string[] } = {}
  ) {
    return this.findOne(appId).then(app => {
      if (!app) {
        throw ErrorManager.makeError('Application not found', {
          type: GENERAL_ERROR_TYPES.COMMON.NOT_FOUND,
        });
      }

      const isFullExportMode = format !== EXPORT_MODE.FORMAT_FLOWS;
      const exportOptions = { isFullExportMode, onlyThisActions: flowIds };

      return exportApplication(app, exportOptions);
    });
  }

  validate(app, { clean } = { clean: false }) {
    let options;
    if (clean) {
      options = { removeAdditional: true, useDefaults: true };
    }
    return Promise.resolve(Validator.validateFullApp(app, options));
  }

  /**
   * Alias for AppsManager::find
   * @param args
   */
  list(...args) {
    return this.find(...args);
  }
}

function getAppNameForSearch(rawName) {
  return rawName ? escapeRegExp(rawName.trim().toLowerCase()) : undefined;
}

function cleanInput(app) {
  const cleanedApp = pick(app, EDITABLE_FIELDS);
  if (cleanedApp.name) {
    cleanedApp.name = cleanedApp.name.trim();
  }
  return cleanedApp;
}

function appDefaults(app) {
  const now = new Date().toISOString();
  return defaults(app, {
    createdAt: now,
    updatedAt: null,
    triggers: [],
    actions: [],
  });
}

function cleanForOutput(app) {
  const cleanedApp = Object.assign({ id: app._id }, app);
  return pick(cleanedApp, PUBLISH_FIELDS);
}

function nowISO() {
  return new Date().toISOString();
}

function ensureUniqueName(forName, appsDb: Database) {
  const normalizedName = escapeRegExp(forName.trim().toLowerCase());
  return appsDb.find({ name: new RegExp(`^${normalizedName}`, 'i') }).then(apps => {
    const greatestIndex = findGreatestNameIndex(forName, apps);
    return greatestIndex < 0 ? forName : `${forName} (${greatestIndex + 1})`;
  });
}
