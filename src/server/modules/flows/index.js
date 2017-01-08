import pick from 'lodash/pick';
import defaults from 'lodash/defaults';
import kebabCase from 'lodash/kebabCase';
import lowerCase from 'lodash/lowerCase';

import { flowsDBService } from '../../config/app-config';
import { VIEWS } from '../../common/db/flows';
import { ErrorManager } from '../../common/errors';
import { CONSTRAINTS } from '../../common/validation';

import { PUBLISH_FIELDS_LONG, PUBLISH_FIELDS_SHORT } from './constants';

/*

 */

export class FlowsManager {

  static create(flow) {
    // TODO
  }

  /**
   *
   * @param app
   * @param appId if not provided will try to use app.id
   */
  static update(flow, flowId = null) {
    // TODO
  }

  static save(flow, flowId = null) {
    // TODO
  }

  static delete(flowId) {
    // TODO
  }

  /**
   * List or find all apps
   *
   * ## searchTerms
   * - name {string} find by name with exactly this name (case insensitive)
   *
   * ## options
   * - fields {boolean|string} Possible values:
   *    - short {string} - get short version of the flows
   *    - full {string} -  get full version of the flows
   *    - raw {string} (deprecated) -  get raw version from db
   *    - true {boolean} - same as 'short'
   *    - false {boolean} - do not get the flows
   *
   * @param terms
   * @params terms.name {string} name of flow
   * @params terms.appId {string} id of the app
   * @params options
   * @params options.fields {string} which fields to retrieve, defaults to 'short' version
   * @params options.withApp {boolean} fetch related app. Default false.
   */
  static find(terms = {}, { fields, withApp } = { fields: 'short', withApp: false }) {
    const options = { include_docs: true };
    // todo: include name
    if (terms.appId) {
      options.key = terms.appId;
    }
    return flowsDBService.db
      .query(`views/${VIEWS.appId}`, options)
      .then(result => (result.rows || [])
        .map(flowRow => cleanForOutput(flowRow.doc, fields)),
      );
    // TODO: get app
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
   * @params flowId {string} flow id
   * @params options
   * @params options.fields {string} which fields to retrieve, defaults to 'full' version
   * @params options.withApp {boolean} fetch related app. Default false.
   */
  static findOne(flowId, { fields, withApp } = { fields: 'full', withApp: false }) {
    /*
     1. find app with the specified id
     1.1 if app exists retrieve related flows if applicable (based on withflows)
     */
    // TODO: handle not found
    return flowsDBService.db.get(flowId)
      .then((response) => {
        const appPromise = cleanForOutput(response, fields);
        return appPromise;
      })
      .catch((err) => {
        if (err.name === 'not_found') {
          return Promise.resolve(null);
        }
        throw err;
      });
  }

  /**
   * Alias for AppManager::find
   * @param args
   */
  static list(...args) {
    return FlowsManager.find(args);
  }

}
export default FlowsManager;

function getFlowNameForSearch(rawName) {
  return rawName ? lowerCase(rawName.trim()) : undefined;
}

function validate(app) {
  const errors = [];
  let promise = Promise.resolve(true);

  const appName = getFlowNameForSearch(app.name);
  if (!appName) {
    errors.push({
      property: 'name',
      title: 'Name cannot be empty',
      value: app.name,
      type: CONSTRAINTS.REQUIRED,
    });
  }

  if (appName) {
    promise = appsDBService
      .db.query(`views/${VIEWS.name}`, { key: appName })
      .then((result) => {
        const rows = result.rows ? result.rows.filter(row => row.id !== app.id) : [];
        if (rows.length) {
          errors.push({
            property: 'name',
            title: 'Name already exists',
            detail: 'There\'s another app with that name',
            value: app.name,
            type: CONSTRAINTS.UNIQUE,
          });
        }
      });
  }

  return promise.then(() => {
    if (errors.length) {
      throw ErrorManager.createValidationError(errors[0].message || 'Validation errors', errors);
    } else {
      return true;
    }
  });
}

function cleanInput(app) {
  const cleanedApp = pick(app, EDITABLE_FIELDS);
  cleanedApp.name = app.name ? app.name.trim() : app.name;
  return cleanedApp;
}

function build(app) {
  const now = (new Date()).toISOString();
  return defaults(
    { normalizedName: kebabCase(app.name).trim() },
    app,
    { updatedAt: now, createdAt: now, version: null },
  );
}

function cleanForOutput(flow, fields) {
  let cleanFlow = Object.assign({
    id: flow.id || flow._id,
    updatedAt: flow.updatedAt || flow.updated_at,
    createdAt: flow.createdAt || flow.created_at,
  }, flow);

  if (fields === 'short') {
    cleanFlow = pick(cleanFlow, PUBLISH_FIELDS_SHORT);
  } else if (fields === 'full') {
    cleanFlow = pick(cleanFlow, PUBLISH_FIELDS_LONG);
  }
  return cleanFlow;
}

