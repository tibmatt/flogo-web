import pick from 'lodash/pick';
import defaults from 'lodash/defaults';
import kebabCase from 'lodash/kebabCase';
import lowerCase from 'lodash/lowerCase';

import {appsDBService} from '../../config/app-config';
import {VIEWS} from '../../common/db/apps';
import {ErrorManager} from '../../common/errors';
import {CONSTRAINTS} from '../../common/validation';

/**
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
  'description'
];

const PUBLISH_FIELDS = [
  'id',
  'name',
  'normalizedName',
  'version',
  'description',
  'version',
  'createdAt',
  'updatedAt'
];

export class AppManager {

  static create(app) {
    let cleanApp = cleanInput(app);

    return validate(cleanApp).then(() => {
      cleanApp = build(app);
      return appsDBService.db
        .post(cleanApp)
        .then(response => {
          return AppManager.findOne(response.id);
        });
    });

  }

  /**
   *
   * @param app
   * @param appId if not provided will try to use app.id
   */
  static update(app, appId = null) {
    /*
     1. validate structure
     2. validate name is unique (except for this same app)
     4. store
     */
  }

  static save(app, appId = null) {


  }

  static delete(appId) {
    /* 1. delete related flows
      2. delete this app
     */
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
    let options = {'include_docs': true};
    if (terms.name) {
      options.key = getAppNameForSearch(terms.name);
    }
    return appsDBService.db
      .query(`views/${VIEWS.name}`, options)
      .then(result => (result.rows || [])
        .map(appRow => cleanForOutput(appRow.doc))
      )
      .then(apps => {
        if (withFlows) {
          // TODO: get related flows
          return Promise.all(apps.map(app => {
            return getFlowsForApp(app.id, withFlows).then(flows => {
              app.flows = flows;
              return app;
            })
          }));
        } else {
          return apps;
        }
      });

    /*
    1. findAllApps with terms
    2. if withFlows retrieve flows for each app based on withflows value
     */
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
    /*
     1. find app with the specified id
     1.1 if app exists retrieve related flows if applicable (based on withflows)
     */
    //TODO: handle not found
    return appsDBService.db.get(appId)
      .then(response => {
        let appPromise = cleanForOutput(response);
        if (withFlows) {
          appPromise.then(app => {
            getFlowsForApp(app.id, withFlows)
              .then(flows => app.flows = flows)
              .then(() => app);
          });
        }
        return appPromise;
      })
      .catch(err => {
        if (err.name == 'not_found') {
          return Promise.resolve(null);
        } else {
          throw error;
        }
      });
  }

  /**
   * Alias for AppManager::find
   * @param args
   */
  static list(...args) {
    return AppManager.find(args);
  }

}

function getAppNameForSearch(rawName) {
  return rawName ? lowerCase(rawName.trim()) : undefined;
}

function validate(app) {

  let errors = [];
  let promise = Promise.resolve(true);

  let appName = getAppNameForSearch(app.name);
  if (!appName) {
    errors.push({
      property: 'name',
      title: 'Name cannot be empty',
      value: app.name,
      type: CONSTRAINTS.REQUIRED
    });
  }

  if (appName) {
    promise = appsDBService
      .db.query(`views/${VIEWS.name}`, {key: appName})
      .then(result => {
        let rows = result.rows ? result.rows.filter(row => row.id !== app.id) : [];
        if (rows.length) {
          errors.push({
            property: 'name',
            title: 'Name already exists',
            detail: 'There\'s another app with that name',
            value: app.name,
            type: CONSTRAINTS.UNIQUE
          });
        }
      });
  }

  return promise.then(() => {

    if (errors.length) {
      throw ErrorManager.createValidationError(errors[0].message||'Validation errors', errors);
    } else {
      return true;
    }

  });


}

function cleanInput(app) {
  app = pick(app, EDITABLE_FIELDS);
  app.name = app.name ? app.name.trim() : app.name;
  return app;
}

function build(app) {
  let now = (new Date()).toISOString();
  return defaults(
    {normalizedName: kebabCase(app.name).trim()},
    app,
    {updatedAt: now, createdAt: now, version: null}
  );
}

function cleanForOutput(app) {
  app = Object.assign({id: app.id}, app);
  return pick(app, PUBLISH_FIELDS);
}

function getFlowsForApp(appId, type) {
  return Promise.resolve([]);
}
