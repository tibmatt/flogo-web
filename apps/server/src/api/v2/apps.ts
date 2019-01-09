// const Router = require('koa-router');
import Router from 'koa-router';
import { ERROR_TYPES, ErrorManager } from '../../common/errors';
import { exportApp } from './apps/export';
import { buildApp } from './apps/build';

import { Container } from 'inversify';
import { Context } from 'koa';
import { appsServiceMiddleware } from './shared/apps-service-middleware';
import { AppImporterFactory, importApp } from '../../modules/importer';

export function apps(router: Router, container: Container) {
  const appsRouter = new Router();
  appsRouter
    .use(appsServiceMiddleware(container))
    .get('/', listApps)
    .post('/', createApp)
    .post('\\:import', async ctx => {
      const appImporterFactory = container.resolve(AppImporterFactory);
      await handleAppImport(appImporterFactory, ctx);
    })
    // ex. /apps/zA45E:export
    // needs to be registered before .get('/:appId')
    .get('/:appId\\:export', exportApp)
    .get('/:appId', getApp)
    .get('/:appId/build', buildApp)
    .patch('/:appId', updateApp)
    .del('/:appId', deleteApp)
    .post('\\:validate', validateApp);
  router.use('/apps', appsRouter.routes(), appsRouter.allowedMethods());
}

async function listApps(ctx: Context) {
  const searchTerms: { name?: string } = {};
  const filterName = ctx.request.query['filter[name]'];
  if (filterName) {
    searchTerms.name = filterName;
  }

  const foundApps = await ctx.appsService.find(searchTerms);
  ctx.body = {
    data: foundApps || [],
  };
}

async function createApp(ctx: Context) {
  const body = ctx.request.body;
  try {
    const app = await ctx.appsService.create(body);
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

async function getApp(ctx: Context) {
  const appId = ctx.params.appId;

  const app = await ctx.appsService.findOne(appId, { withFlows: 'short' });

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

async function updateApp(ctx: Context) {
  try {
    const appId = ctx.params.appId;
    const data = ctx.request.body || {};

    const app = await ctx.appsService.update(appId, data);

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

async function deleteApp(ctx: Context) {
  const appId = ctx.params.appId;
  const removed = await ctx.appsService.remove(appId);

  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Application not found', {
      title: 'Application not found',
      detail: 'No application with the specified id',
    });
  }

  ctx.status = 204;
}

async function handleAppImport(appImporterFactory: AppImporterFactory, ctx: Context) {
  try {
    ctx.body = await importApp(ctx.request.body, appImporterFactory);
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

async function validateApp(ctx: Context) {
  const data = ctx.request.body || {};
  const errors = await ctx.appsService.validate(data, { clean: true });
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
