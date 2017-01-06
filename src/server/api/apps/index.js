import {config} from '../../config/app-config';
import {AppManager} from '../../modules/apps';
import {ErrorManager, ERROR_TYPES} from '../../common/errors';

let basePath = config.app.basePath;

export function apps(app, router) {
  if (!app) {
    console.error(new Error('Missing app" parameter'));
  }

  router.get(basePath + '/apps', listApps);
  router.post(basePath + '/apps', createApp);

  router.get(basePath + '/apps/:appId', getApp);
}

/**
 */
function* listApps() {

  let searchTerms = {};
  let filterName = this.request.query['filter[name]'];
  if (filterName) {
    searchTerms.name = filterName;
  }

  let apps = yield AppManager.find(searchTerms, {withFlows: true});
  this.body = {
    data: apps || []
  };
}

function* createApp() {
  // throw error if it is not json?
  let data = this.request.body || {};

  try {

    let app = yield AppManager.create(data);
    this.body = {
      data: app
    };

  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      error = ErrorManager.createRestError('Validation error in /apps getApp', {
        status: 400,
        title: 'Validation error',
        detail: 'There were one or more validation problems',
        meta: ErrorManager.validationToRestErrors(error.details.errors)
      });
    }

    throw error;
  }

}

function* getApp() {
  let appId = this.params.appId;

  let app = yield AppManager.findOne(appId, {withFlows: 'short'});

  if (!app) {
    throw ErrorManager.createRestNotFoundError('Application not found', {
      title: 'Application not found',
      detail: 'No application with the specified id'
    });
  }

  this.body = {
    data: app
  };
}

