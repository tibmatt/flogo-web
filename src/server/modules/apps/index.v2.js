import pick from 'lodash/pick';
import defaults from 'lodash/defaults';
import toInteger from 'lodash/toInteger';
import fromPairs from 'lodash/fromPairs';
import isEqual from 'lodash/isEqual';

import shortid from 'shortid';

import { DEFAULT_APP_ID } from '../../common/constants';

import { appsDBService } from '../../config/app-config';
import { VIEWS } from '../../common/db/apps';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';
import { CONSTRAINTS } from '../../common/validation';
import { FlowsManager } from '../flows';
import { importFlows } from './import';
import { consolidateFlowsAndTriggers } from './export';

import { apps as appStore } from '../../common/db';
import { logger } from '../../common/logging';
import { Validator } from './validator';

/*
app:
  properties:
    id:
      type: string
    name:
      type: string
      required: true
    normalizedName:
      type: string
      readOnly: true
    version:
      type: string
    description:
      type: string
    createdAt:
      type: string
      format: dateTime
      readOnly: true
    updatedAt:
      type: string
      format: dateTime
      readOnly: true
    flows:
      type: array
      readOnly: true
 */

const EDITABLE_FIELDS = [
  'name',
  'version',
  'description',
];

const PUBLISH_FIELDS = [
  'id',
  'name',
  'type',
  'version',
  'description',
  'version',
  'createdAt',
  'updatedAt',
  'triggers',
  'actions',
];

const DEFAULT_APP = {
  _id: DEFAULT_APP_ID,
  name: 'Default app',
  description: 'App created by default',
  version: '0.0.1',
};

export class AppsManager {

  static create(app) {
    let inputData = app;
    const errors = Validator.validate(inputData);
    if (errors) {
      return Promise.reject(ErrorManager.createValidationError('Validation error', errors));
    }
    inputData._id = shortid.generate();
    inputData.name = inputData.name.trim();
    inputData = build(inputData);
    return appStore.insert(inputData)
      .catch(error => {
        if (error.errorType === 'uniqueViolated') {
          logger.debug(`Name ${inputData.name} already exists, will create new name`);
          return ensureUniqueName(inputData.name)
            .then(name => {
              logger.debug(`Will use ${name}`);
              inputData.name = name;
              return appStore.insert(inputData);
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
  static update(appId, newData) {
    const inputData = cleanInput(newData);
    return appStore
      // fetch editable fields only
      .findOne({ _id: appId }, fromPairs(EDITABLE_FIELDS.concat('_id').map(field => [field, 1])))
      .then(app => {
        if (!app) {
          throw ErrorManager.makeError('App not found', { type: ERROR_TYPES.COMMON.NOT_FOUND });
        }

        const mergedData = Object.assign({}, app, inputData);
        if (isEqual(mergedData, app)) {
          // no changes, we don't need to update anything
          return false;
        }

        const errors = Validator.validate(mergedData);
        if (errors) {
          throw ErrorManager.createValidationError('Validation error', { details: errors });
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
          return appStore.update({ _id: appId }, { $set: Object.assign({ updatedAt: nowISO() }, inputData) });
        }
        return null;
      })
      .then(() => AppsManager.findOne(appId, { withFlows: true }));

    function validateUniqueName(inputName) {
      const name = getAppNameForSearch(inputName);
      return appStore.findOne({ _id: { $ne: appId }, name: new RegExp(`^${name}$`, 'i') }, { _id: 1, name: 1 })
        .then(nameExists => {
          if (nameExists) {
            throw ErrorManager.createValidationError('Validation error', [{
              property: 'name',
              title: 'Name already exists',
              detail: 'There\'s another app with that name',
              value: inputName,
              type: CONSTRAINTS.UNIQUE,
            }]);
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
  static remove(appId) {
    return appStore
      .remove({ _id: appId })
      .then(numRemoved => numRemoved > 0);
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
  static find(terms = {}, { withFlows } = { withFlows: false }) {
    if (terms.name) {
      const name = getAppNameForSearch(terms.name);
      terms.name = new RegExp(`^${name}$`, 'i');
    }

    return appStore.find(terms)
      .then(apps => apps.map(cleanForOutput));
    // todo: clean
    // return appsDBService.db
    //   .query(`views/${VIEWS.name}`, options)
    //   .then(result => (result.rows || [])
    //     .map(appRow => cleanForOutput(appRow.doc)),
    //   )
    //   .then(apps => (withFlows ? augmentWithFlows(apps, withFlows) : apps));
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
  static findOne(appId, { withFlows } = { withFlows: false }) {
    return appStore.findOne({ _id: appId })
      .then(app => app ? cleanForOutput(app) : null);
    // // TODO: clean
    // return appsDBService.db.get(appId)
    //   .then((response) => {
    //     const cleanApp = Promise.resolve(cleanForOutput(response));
    //     let appPromise = Promise.resolve(cleanApp);
    //     if (withFlows) {
    //       appPromise = appPromise.then((app) => {
    //         const augmentedApp = app;
    //         return getFlowsForApp(app.id, withFlows)
    //           .then((flows) => {
    //             augmentedApp.flows = flows;
    //             return augmentedApp;
    //           });
    //       });
    //     }
    //     return appPromise;
    //   })
    //   .catch((err) => {
    //     if (err.name === 'not_found') {
    //       return Promise.resolve(null);
    //     }
    //     throw err;
    //   });
  }


  // TODO documentation
  static import(importedJSON) {
    return this.create(importedJSON)
      .then((app) => {
        let { triggers, actions } = importedJSON;
        let importedFlows = Object.assign({}, { createdApp: app }, { triggers, actions });
        return importFlows(importedFlows);
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Export an app to the schema expected by cli
   * This will export apps and flows
   * @param appId {string} app to export
   * @return {object} exported object
   * @throws Not found error if app not found
   */
  static export(appId) {
    throw new Error('Not implemented');
    // return AppsManager.findOne(appId, { withFlows: 'raw' })
    //   .then((app) => {
    //     if (!app) {
    //       throw ErrorManager.makeError('Application not found', { type: ERROR_TYPES.COMMON.NOT_FOUND });
    //     }
    //     return Promise.all([
    //       app,
    //       FlowsManager.convertManyToCliSchema({ appId }),
    //     ]);
    //   })
    //   .then((data) => {
    //     const [app, flowsData] = data;
    //     const consolidatedData = consolidateFlowsAndTriggers(flowsData);
    //     return {
    //       name: app.name,
    //       type: 'flogo:app',
    //       version: app.version || '0.0.1',
    //       description: app.description,
    //       triggers: consolidatedData.triggers,
    //       actions: consolidatedData.flows,
    //     };
    //   });
  }

  /**
   * Fetch many apps by their id
   *
   * Options:
   *    * ## options
   *    - withFlows {boolean|string} get also all the related flows. Possible values:
   *      - short {string} - get short version of the flows
   *      - full {string} -  get full version of the flows
   *      - true {boolean} - same as 'short'
   *      - false {boolean} - do not get the flows
   * @param appIds {string[]} ids of the apps to fetch
   * @param options
   * @param options.withFlows retrieve flows
   */
  static fetchManyById(appIds = [], { withFlows } = { withFlows: false }) {
    return appsDBService.db
      .allDocs({
        keys: appIds,
        include_docs: true,
      })
      .then(result => (result.rows || [])
        .filter((appRow) => {
          const isError = appRow.error;
          const isDeleted = appRow.value && appRow.value.deleted;
          return !isError && !isDeleted;
        })
        .map(appRow => cleanForOutput(appRow.doc)),
      )
      .then(apps => (withFlows ? augmentWithFlows(apps, withFlows) : apps));
  }

  /**
   * Alias for AppsManager::find
   * @param args
   */
  static list(...args) {
    return AppsManager.find(args);
  }

  static ensureDefaultApp() {
    const db = appsDBService.db;

    db.get('_local/default_installed')
      .then(() => true)
      .catch((err) => {
        if (err.name === 'not_found') {
          const app = build(DEFAULT_APP);
          return db.put(app)
            .then(() => db.put('_local/default_installed'));
        }
        throw err;
      });
  }

}
export default AppsManager;

function getAppNameForSearch(rawName) {
  return rawName ? rawName.trim().toLowerCase() : undefined;
}

function cleanInput(app) {
  const cleanedApp = pick(app, EDITABLE_FIELDS);
  if (cleanedApp.name) {
    cleanedApp.name = cleanedApp.name.trim();
  }
  return cleanedApp;
}

function build(app) {
  const now = (new Date()).toISOString();
  return defaults(
    app,
    { createdAt: now, updatedAt: null, triggers: [], actions: [] },
  );
}

function cleanForOutput(app) {
  const cleanedApp = Object.assign({ id: app._id }, app);
  return pick(cleanedApp, PUBLISH_FIELDS);
}

function getFlowsForApp(appId, type) {
  return FlowsManager.find({ appId }, { fields: type });
}

function augmentWithFlows(apps, flowFields) {
  return Promise.all(apps.map(app => getFlowsForApp(app.id, flowFields)
    .then((flows) => {
      const augmentedApp = app;
      augmentedApp.flows = flows;
      return augmentedApp;
    })));
}

function nowISO() {
  return (new Date()).toISOString();
}

function ensureUniqueName(forName) {
  const normalizedName = forName.trim().toLowerCase();

  return appStore.find({ name: new RegExp(`^${normalizedName}`, 'i') })
    .then(apps => {
      const greatestIndex = findGreatestNameIndex(apps);
      return greatestIndex < 0 ? forName : `${forName} (${greatestIndex + 1})`;
    });

  function findGreatestNameIndex(apps) {
    const namePattern = new RegExp(`^${normalizedName}(\\s+\\((\\d+)\\))?$`, 'i');
    return apps.reduce((greatest, app) => {
      const matches = namePattern.exec(app.name);
      if (matches) {
        const index = toInteger(matches[2]);
        return index > greatest ? index : greatest;
      }
      return greatest;
    }, -1);
  }
}
