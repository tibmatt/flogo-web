const Router = require('koa-router');
import { AppsManager } from '../../modules/apps';
import { ResourceStorageRegistry } from '../../modules/resource-storage-registry';
import { ERROR_TYPES, ErrorManager } from '../../common/errors';
import { exportApp } from './apps/export';
import { buildApp } from './apps/build';

export function apps(router) {
  const apps = new Router();
  apps
    .get('/', listApps)
    .post('/', createApp)
    .post('\\:import', importApp)
    // ex. /apps/zA45E:export
    // needs to be registered before .get('/:appId')
    .get('/:appId\\:export', exportApp)
    .get('/:appId', getApp)
    .get('/:appId/build', buildApp)
    .patch('/:appId', updateApp)
    .del('/:appId', deleteApp)
    .post('\\:validate', validateApp);
  router.use('/apps', apps.routes(), apps.allowedMethods());
}

async function listApps(ctx, next) {
  const searchTerms = {};
  const filterName = ctx.request.query['filter[name]'];
  if (filterName) {
    searchTerms.name = filterName;
  }

  const foundApps = await AppsManager.find(searchTerms);
  ctx.body = {
    data: foundApps || [],
  };
}

async function createApp(ctx) {
  const body = ctx.request.body;
  try {
    const app = await AppsManager.create(body);
    ctx.body = {
      data: app,
    };
  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw ErrorManager.createRestError('Validation error in /apps createApp', {
        status: 400,
        title: 'Validation error',
        detail: 'There were one or more validation problems',
        meta: error.details.errors,
      });
    }
    throw error;
  }
}

async function getApp(ctx, next) {
  const appId = ctx.params.appId;

  const app = await AppsManager.findOne(appId, { withFlows: 'short' });

  if (!app) {
    throw ErrorManager.createRestNotFoundError('Application not found', {
      title: 'Application not found',
      detail: 'No application with the specified id',
    });
  }

  ctx.body = {
    data: app,
  };
}

async function updateApp(ctx, next) {
  try {
    const appId = ctx.params.appId;
    const data = ctx.request.body || {};

    const app = await AppsManager.update(appId, data);

    ctx.body = {
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

async function deleteApp(ctx, next) {
  const appId = ctx.params.appId;
  const removed = await AppsManager.remove(appId);

  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Application not found', {
      title: 'Application not found',
      detail: 'No application with the specified id',
    });
  }

  ctx.status = 204;
}

async function importApp(ctx, next) {
  try {
    ctx.body = await AppsManager.import(ctx.request.body, ResourceStorageRegistry);
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

async function validateApp(ctx, next) {
  const data = ctx.request.body || {};
  const errors = await AppsManager.validate(data, { clean: true });
  ctx.status = 200;
  if (errors && errors.length > 0) {
    ctx.status = 400;
    ctx.body = {
      errors,
    };
  } else {
    ctx.status = 200;
    ctx.body = data;
  }
}
