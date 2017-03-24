import { HandlersManager } from '../../modules/apps/handlers';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';

export function handlers(router, basePath) {
  router.get(`${basePath}/triggers/:triggerId/handlers`, listHandlers);
  router.get(`${basePath}/triggers/:triggerId/handlers/:actionId`, getHandler);
  router.put(`${basePath}/triggers/:triggerId/handlers/:actionId`, saveHandler);
  router.del(`${basePath}/triggers/:triggerId/handlers/:actionId`, deleteHandler);
}

function* listHandlers() {
  const triggerId = this.params.triggerId;
  const handlerList = yield HandlersManager.list(triggerId);
  this.body = {
    data: handlerList || [],
  };
}

function* saveHandler() {
  const triggerId = this.params.triggerId;
  const actionId = this.params.actionId;
  const body = this.request.body;
  try {
    const handler = yield HandlersManager.save(triggerId, actionId, body);
    this.body = {
      data: handler,
    };
  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw ErrorManager.createRestError('Validation error in /handlers create handler', {
        status: 400,
        title: 'Validation error',
        detail: 'There were one or more validation problems',
        meta: error.details.errors,
      });
    } else if (error.type === ERROR_TYPES.COMMON.NOT_FOUND) {
      throw ErrorManager.createRestNotFoundError('Action or trigger not found', {
        title: 'Action or trigger not found',
        detail: 'Action or trigger not found. Make sure they exist and they are registered in the same app.',
      });
    }
    throw error;
  }
}

function* getHandler() {
  const triggerId = this.params.triggerId;
  const actionId = this.params.actionId;

  const handler = yield HandlersManager.findOne(triggerId, actionId);

  if (!handler) {
    throw ErrorManager.createRestNotFoundError('Handler not found', {
      title: 'Handler not found',
      detail: 'No handler with the specified ids',
      value: {
        triggerId,
        actionId,
      },
    });
  }

  this.body = {
    data: handler,
  };
}

function* deleteHandler() {
  const triggerId = this.params.triggerId;
  const actionId = this.params.actionId;
  const removed = yield HandlersManager.remove(triggerId, actionId);

  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Handler not found', {
      title: 'Handler not found',
      detail: 'No handler with the specified ids',
      value: {
        actionId,
        triggerId,
      },
    });
  }

  this.status = 204;
}

