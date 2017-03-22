import { config } from '../../config/app-config';
import { AppsManager } from '../../modules/apps/index.v2';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';

const basePathV2 = config.app.basePathV2;

export function apps(router) {
  router.get(`${basePathV2}/apps`, listApps);
  router.post(`${basePathV2}/apps`, createApp);

  router.get(`${basePathV2}/apps/:appId`, getApp);
  router.patch(`${basePathV2}/apps/:appId`, updateApp);
  router.del(`${basePathV2}/apps/:appId`, deleteApp);
}

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
//
// function* createApp() {
//   // throw error if it is not json?
//   const data = this.request.body || {};
//
//   try {
//     const app = yield AppsManager.create(data);
//     this.body = {
//       data: app,
//     };
//   } catch (error) {
//     if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
//       throw ErrorManager.createRestError('Validation error in /apps getApp', {
//         status: 400,
//         title: 'Validation error',
//         detail: 'There were one or more validation problems',
//         meta: ErrorManager.validationToRestErrors(error.details.errors),
//       });
//     }
//
//     throw error;
//   }
// }

function* createApp() {
  const body = this.request.body;
  try {
    const app = yield AppsManager.create(body);
    this.body = {
      data: app,
    };
  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw ErrorManager.createRestError('Validation error in /apps getApp', {
        status: 400,
        title: 'Validation error',
        detail: 'There were one or more validation problems',
        meta: error.details.errors,
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

function* updateApp() {
  try {
    const appId = this.params.appId;
    const data = this.request.body || {};
    const app = yield AppsManager.update(appId, data);

    this.body = {
      data: app,
    };
  } catch (error) {
    if (error.isOperational) {
      if (error.type === ERROR_TYPES.COMMON.VALIDATION) {
        throw ErrorManager.createRestError('Validation error in /apps getApp', {
          status: 400,
          title: 'Validation error',
          detail: 'There were one or more validation problems',
          meta: error.details.errors,
        });
      } else if (error.type === ERROR_TYPES.COMMON.NOT_FOUND) {
        throw ErrorManager.createRestNotFoundError('Application not found', {
          title: 'Application not found',
          detail: 'No application with the specified id',
        });
      }
    }
    throw error;
  }
}


function* deleteApp() {
  const appId = this.params.appId;
  const removed = yield AppsManager.remove(appId);

  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Application not found', {
      title: 'Application not found',
      detail: 'No application with the specified id',
    });
  }

  this.status = 204;
}

