import { AppsTriggersManager } from '../../modules/apps/triggers';
import { ERROR_TYPES, ErrorManager } from '../../common/errors';
import { buildTrigger } from './triggers/build';

export function triggers(router) {
  router.get(`/apps/:appId/triggers`, listTriggers);
  router.post(`/apps/:appId/triggers`, createTrigger);
  // !!IMPORTANT :shim endpoint should be declared before the other /triggers/{triggerId} urls
  router.get(`/triggers/:triggerId\\:shim`, buildTrigger);
  router.get(`/triggers/:triggerId`, getTrigger);
  router.patch(`/triggers/:triggerId`, updateTrigger);
  router.del(`/triggers/:triggerId`, deleteTrigger);
}

async function listTriggers(ctx, next) {
  const appId = ctx.params.appId;
  const searchTerms = {};
  const filterName = ctx.request.query['filter[name]'];
  if (filterName) {
    searchTerms.name = filterName;
  }
  const triggerList = await AppsTriggersManager.list(appId, searchTerms);
  ctx.body = {
    data: triggerList || [],
  };
}

async function createTrigger(ctx, next) {
  const appId = ctx.params.appId;
  const body = ctx.request.body;
  try {
    const trigger = await AppsTriggersManager.create(appId, body);
    ctx.body = {
      data: trigger,
    };
  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw ErrorManager.createRestError('Validation error in /triggers create trigger', {
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

async function getTrigger(ctx, next) {
  const triggerId = ctx.params.triggerId;

  const trigger = await AppsTriggersManager.findOne(triggerId);

  if (!trigger) {
    throw ErrorManager.createRestNotFoundError('Trigger not found', {
      title: 'Trigger not found',
      detail: 'No trigger with the specified id',
      value: triggerId,
    });
  }

  ctx.body = {
    data: trigger,
  };
}

async function updateTrigger(ctx, next) {
  const triggerId = ctx.params.triggerId;
  const data = ctx.request.body || {};
  try {
    const app = await AppsTriggersManager.update(triggerId, data);

    ctx.body = {
      data: app,
    };
  } catch (error) {
    if (error.isOperational) {
      if (error.type === ERROR_TYPES.COMMON.VALIDATION) {
        throw ErrorManager.createRestError('Validation error in /trigger updateTrigger', {
          status: 400,
          title: 'Validation error',
          detail: 'There were one or more validation problems',
          meta: error.details.errors,
        });
      } else if (error.type === ERROR_TYPES.COMMON.NOT_FOUND) {
        throw ErrorManager.createRestNotFoundError('Trigger not found', {
          title: 'Trigger not found',
          detail: 'No trigger with the specified id',
          value: triggerId,
        });
      }
    }
    throw error;
  }
}


async function deleteTrigger(ctx, next) {
  const triggerId = ctx.params.triggerId;
  const removed = await AppsTriggersManager.remove(triggerId);

  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Trigger not found', {
      title: 'Trigger not found',
      detail: 'No trigger with the specified id',
      value: triggerId,
    });
  }

  ctx.status = 204;
}
