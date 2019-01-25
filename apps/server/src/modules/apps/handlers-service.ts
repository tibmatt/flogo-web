import { defaults, isEmpty, pick } from 'lodash';
import { injectable, inject } from 'inversify';
import { TOKENS } from '../../core';
import { Database } from '../../common/database.service';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';
import { Validator } from './validator';
import { ISONow } from '../../common/utils';

const EDITABLE_FIELDS = ['settings', 'outputs', 'actionMappings'];

@injectable()
export class HandlersService {
  constructor(@inject(TOKENS.AppsDb) private appsDb: Database) {}

  save(triggerId, actionId, handlerData) {
    if (!triggerId || !actionId) {
      throw new TypeError('Params triggerId and actionId are required');
    }

    const findQuery = { 'triggers.id': triggerId, 'actions.id': actionId };
    return this.appsDb.findOne(findQuery, { actions: 1, triggers: 1 }).then(app => {
      if (!app) {
        throw ErrorManager.makeError('App not found', {
          type: ERROR_TYPES.COMMON.NOT_FOUND,
        });
      }

      const errors = Validator.validateHandler(handlerData);
      if (errors) {
        throw ErrorManager.createValidationError('Validation error', errors);
      }
      let handler = cleanInput(handlerData, EDITABLE_FIELDS);

      const triggerIndex = app.triggers.findIndex(t => t.id === triggerId);
      const trigger = app.triggers[triggerIndex];

      let updateQuery = {};
      const now = ISONow();

      const existingHandlerIndex = trigger.handlers.findIndex(
        h => h.actionId === actionId
      );
      if (existingHandlerIndex >= 0) {
        const existingHandler = trigger.handlers[existingHandlerIndex];
        handler = defaults(handler, existingHandler);
        handler.updatedAt = now;
        updateQuery = {
          $set: {
            [`triggers.${triggerIndex}.handlers.${existingHandlerIndex}`]: handler,
          },
        };
      } else {
        handler = defaults(handler, {
          actionId,
          createdAt: now,
          updatedAt: null,
          settings: {},
          outputs: {},
          actionMappings: {
            input: {},
            output: {},
          },
        });
        updateQuery = {
          $push: { [`triggers.${triggerIndex}.handlers`]: handler },
        };
      }

      return this.appsDb
        .update(findQuery, updateQuery, {})
        .then(modifiedCount => this.findOne(triggerId, actionId));
    });
  }

  findOne(triggerId, actionId) {
    return this.appsDb
      .findOne({ 'triggers.id': triggerId }, { triggers: 1 })
      .then(app => {
        if (!app) {
          return null;
        }
        const trigger = app.triggers.find(t => t.id === triggerId);
        const handler = trigger.handlers.find(h => h.actionId === actionId);
        if (handler) {
          handler.appId = app._id;
          handler.triggerId = trigger.id;
        }
        return handler;
      });
  }

  list(triggerId) {
    return this.appsDb
      .findOne({ 'triggers.id': triggerId })
      .then(app => (app.triggers.handlers ? app.triggers.handlers : []));
  }

  remove(triggerId, actionId) {
    if (!triggerId || !actionId) {
      throw new TypeError('Params triggerId and actionId are required');
    }
    return this.appsDb
      .findOne(
        { 'triggers.id': triggerId, 'actions.id': actionId },
        { triggers: 1, actions: 1 }
      )
      .then(app => {
        const triggerIndex = app.triggers.findIndex(t => t.id === triggerId);
        return this.appsDb.update(
          { 'triggers.id': triggerId, 'actions.id': actionId },
          { $pull: { [`triggers.${triggerIndex}.handlers`]: { actionId } } },
          {}
        );
      })
      .then(numRemoved => numRemoved > 0);
  }

  removeByActionId(actionId) {
    return this.appsDb
      .findOne({ 'triggers.handlers.actionId': actionId }, { triggers: 1 })
      .then(app => {
        if (!app) {
          return null;
        }
        const pull = app.triggers.reduce((result, trigger, index) => {
          const existingHandlers = trigger.handlers.findIndex(
            handler => handler.actionId === actionId
          );
          if (existingHandlers >= 0) {
            result['triggers.' + index + '.handlers'] = { actionId: actionId };
          }
          return result;
        }, {});
        if (!isEmpty(pull)) {
          return this.appsDb.update(
            { 'triggers.handlers.actionId': actionId },
            { $pull: pull },
            {}
          );
        }
        return null;
      })
      .then(numRemoved => numRemoved > 0);
  }
}

function cleanInput(trigger, fields) {
  const cleanTrigger = pick(trigger, fields);
  if (cleanTrigger.name) {
    cleanTrigger.name = cleanTrigger.name.trim();
  }
  return cleanTrigger;
}
