import { config } from '../../config/app-config';
import { AppsManager } from '../../modules/apps';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';

const basePath = config.app.basePath;

export function apps(app, router) {
  if (!app) {
    console.error(new Error('Missing app" parameter'));
  }

  router.get(`${basePath}/apps`, listApps);
  router.post(`${basePath}/apps`, createApp);

  router.get(`${basePath}/apps/:appId`, getApp);
}
export default apps;

/**
 */
function* listApps() {
  const searchTerms = {};
  const filterName = this.request.query['filter[name]'];
  if (filterName) {
    searchTerms.name = filterName;
  }

  const foundApps = yield AppsManager.find(searchTerms);
  this.body = {
    data: foundApps || [],
  };
}

function* createApp() {
  // throw error if it is not json?
  const data = this.request.body || {};

  try {
    const app = yield AppsManager.create(data);
    this.body = {
      data: app,
    };
  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw ErrorManager.createRestError('Validation error in /apps getApp', {
        status: 400,
        title: 'Validation error',
        detail: 'There were one or more validation problems',
        meta: ErrorManager.validationToRestErrors(error.details.errors),
      });
    }

    throw error;
  }
}

function* getApp() {
  const appId = this.params.appId;

  const app = yield AppsManager.findOne(appId, { withFlows: 'short' });

  if (!app) {
    throw ErrorManager.createRestNotFoundError('Application not found', {
      title: 'Application not found',
      detail: 'No application with the specified id',
    });
  }

  this.body = {
    data: app,
  };
}

