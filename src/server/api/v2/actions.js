const Router = require('koa-router');
import { ActionsManager } from '../../modules/actions';
import { ActionCompiler } from '../../modules/engine';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';

export function actions(router) {
  router.get(`/apps/:appId/actions`, listActions);
  router.post(`/apps/:appId/actions`, createAction);

  const actions = new Router();
  actions
    .get(`/recent`, listRecentActions)
    .get(`/:actionId`, getAction)
    .patch(`/:actionId`, updateAction)
    .del(`/:actionId`, deleteAction)
    .get(`/:actionId/build`, makeBuild);
  router.use('/actions', actions.routes(), actions.allowedMethods());
}

async function listActions(ctx, next) {
  const appId = ctx.params.appId;

  const options = {};
  const filterName = ctx.request.query['filter[name]'];
  const filterId = ctx.request.query['filter[id]'];
  const getFields = ctx.request.query['fields'];
  if (filterName || filterId) {
    const filter = options.filter = {};
    if (filterName) {
      filter.by = 'name';
      filter.value = filterName;
    } else if (filterId) {
      filter.by = 'id';
      filter.value = filterId.split(',');
    }
  }

  if (getFields) {
    options.project = getFields.split(',');
  }

  const actionList = await ActionsManager.list(appId, options);
  ctx.body = {
    data: actionList || [],
  };
}

async function listRecentActions(ctx, next) {
  const appId = ctx.params.appId;
  ctx.body = { appId };

  const actionList = await ActionsManager.listRecent();
  ctx.body = {
    data: actionList || [],
  };
}

async function createAction(ctx, next) {
  const appId = ctx.params.appId;
  const body = ctx.request.body;
  try {
    const action = await ActionsManager.create(appId, body);
    ctx.body = {
      data: action,
    };
  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw ErrorManager.createRestError('Validation error in /actions create action', {
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
    throw error;
  }
}

async function getAction(ctx, next) {
  const actionId = ctx.params.actionId;

  const action = await ActionsManager.findOne(actionId);

  if (!action) {
    throw ErrorManager.createRestNotFoundError('Action not found', {
      title: 'Action not found',
      detail: 'No action with the specified id',
      value: actionId,
    });
  }

  ctx.body = {
    data: action,
  };
}

async function updateAction(ctx, next) {
  const actionId = ctx.params.actionId;
  const data = ctx.request.body || {};
  try {
    const app = await ActionsManager.update(actionId, data);

    ctx.body = {
      data: app,
    };
  } catch (error) {
    if (error.isOperational) {
      if (error.type === ERROR_TYPES.COMMON.VALIDATION) {
        throw ErrorManager.createRestError('Validation error in /action updateAction', {
          status: 400,
          title: 'Validation error',
          detail: 'There were one or more validation problems',
          meta: error.details.errors,
        });
      } else if (error.type === ERROR_TYPES.COMMON.NOT_FOUND) {
        throw ErrorManager.createRestNotFoundError('Action not found', {
          title: 'Action not found',
          detail: 'No action with the specified id',
          value: actionId,
        });
      }
    }
    throw error;
  }
}


async function deleteAction(ctx, next) {
  const actionId = ctx.params.actionId;
  const removed = await ActionsManager.remove(actionId);

  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Action not found', {
      title: 'Action not found',
      detail: 'No action with the specified id',
      value: actionId,
    });
  }

  ctx.status = 204;
}

async function makeBuild(ctx, next) {
  const actionId = ctx.params.actionId;

  let compileOptions;
  // TODO: make sure os and arch are valid
  if (ctx.query.os || ctx.query.arch) {
    const { os, arch } = ctx.query;
    compileOptions = { os, arch };
  }

  const exportedAction = await ActionsManager.exportToFlow(actionId);

  if (!exportedAction) {
    throw ErrorManager.createRestNotFoundError('Action not found', {
      title: 'Action not found',
      detail: 'No action with the specified id',
      value: actionId,
    });
  }

  const { trigger, flow } = exportedAction;
  ctx.body = await ActionCompiler.compileFlow(trigger, flow, compileOptions);
  ctx.type = 'application/octet-stream';
  ctx.attachment();

  next();
}

