import { AppsTriggersManager } from '../../modules/apps/triggers';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';

export function triggers(router, basePath) {
  router.get(`${basePath}/apps/:appId/triggers`, listTriggers);
  router.post(`${basePath}/apps/:appId/triggers`, createTrigger);
  router.get(`${basePath}/triggers/:triggerId`, getTrigger);
  router.patch(`${basePath}/triggers/:triggerId`, updateTrigger);
  router.del(`${basePath}/triggers/:triggerId`, deleteTrigger);
}

function* listTriggers() {
  const appId = this.params.appId;
  const triggerList = yield AppsTriggersManager.list(appId);
  this.body = {
    data: triggerList || [],
  };
}

function* createTrigger() {
  const appId = this.params.appId;
  const body = this.request.body;
  try {
    const trigger = yield AppsTriggersManager.create(appId, body);
    this.body = {
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

function* getTrigger() {
  const triggerId = this.params.triggerId;

  const trigger = yield AppsTriggersManager.findOne(triggerId);

  if (!trigger) {
    throw ErrorManager.createRestNotFoundError('Trigger not found', {
      title: 'Trigger not found',
      detail: 'No trigger with the specified id',
      value: triggerId,
    });
  }

  this.body = {
    data: trigger,
  };
}

function* updateTrigger() {
  const triggerId = this.params.triggerId;
  const data = this.request.body || {};
  try {
    const app = yield AppsTriggersManager.update(triggerId, data);

    this.body = {
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


function* deleteTrigger() {
  const triggerId = this.params.triggerId;
  const removed = yield AppsTriggersManager.remove(triggerId);

  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Trigger not found', {
      title: 'Trigger not found',
      detail: 'No trigger with the specified id',
      value: triggerId,
    });
  }

  this.status = 204;
}

