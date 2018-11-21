import pick from 'lodash/pick';
import omit from 'lodash/omit';
import get from 'lodash/get';

import { apps as appsDb, dbUtils, indexer as indexerDb } from '../../common/db';
import { ERROR_TYPES, ErrorManager } from '../../common/errors';
import { CONSTRAINTS } from '../../common/validation';
import { Validator } from './validator';

import { HandlersManager } from '../apps/handlers';
import { TriggerManager as ContribTriggersManager } from '../triggers';

import { findGreatestNameIndex } from '../../common/utils/collection';
import {prepareUpdateQuery} from "./prepare-update-query";

const EDITABLE_FIELDS_CREATION = [
  'name',
  'description',
  'metadata',
  'tasks',
  'links',
  'errorHandler'
];

const EDITABLE_FIELDS_UPDATE = [
  'name',
  'description',
  'metadata',
  'tasks',
  'links',
  'errorHandler',
];

const RECENT_ACTIONS_ID = 'actions:recent';
const MAX_RECENT = 10;

export class ActionsManager {

  static create(appId, actionData) {
    if (!appId) {
      return Promise.reject(ErrorManager.makeError('App not found', { type: ERROR_TYPES.COMMON.NOT_FOUND }));
    }

    return appsDb.findOne({ _id: appId }, { actions: 1 })
      .then(app => {
        if (!app) {
          throw ErrorManager.makeError('App not found', { type: ERROR_TYPES.COMMON.NOT_FOUND });
        }

        const errors = Validator.validate(actionData);
        if (errors) {
          throw ErrorManager.createValidationError('Validation error', {details: errors});
        }

        actionData.name = ensureUniqueName(app.actions, actionData.name);
        return actionData;
      })
      .then(newAction => {
        newAction = cleanInput(actionData, EDITABLE_FIELDS_CREATION);

        newAction.id = dbUtils.generateShortId();
        newAction.name = newAction.name.trim();
        newAction.createdAt = dbUtils.ISONow();
        newAction.updatedAt = null;

        return appsDb.update({ _id: appId }, { $push: { actions: newAction } })
          .then(() => ActionsManager.findOne(newAction.id))
          .then(storedAction => storeAsRecent(storedAction)
            .then(() => storedAction),
          );
      });
  }

  static update(actionId, actionData) {
    return ActionsManager.findOne(actionId)
      .then(existingAction => {
        if (!existingAction) {
          throw ErrorManager.makeError('Action not found', { type: ERROR_TYPES.COMMON.NOT_FOUND });
        }
        const appId = existingAction.appId;
        actionData = cleanInput(actionData, EDITABLE_FIELDS_UPDATE);
        const errors = Validator.validate(Object.assign(existingAction, actionData));
        if (errors) {
          throw ErrorManager.createValidationError('Validation error', errors);
        }

        return atomicUpdate(actionData, actionId, appId)
          .then(updatedCount => {
            if (updatedCount <= 0) {
              return null;
            }

            return ActionsManager.findOne(actionId)
              .then(action => storeAsRecent(action)
                  .then(() => action),
              );
          });
      });
  }

  static findOne(actionId) {
    return appsDb.findOne({ 'actions.id': actionId })
      .then(app => {
        if (!app) {
          return null;
        }
        const action = app.actions.find(t => t.id === actionId);
        action.appId = app._id;

        const triggers = app.triggers.filter(t => {
          const h = t.handlers.filter(a => a.actionId === actionId);
          return h.length > 0;
        });

        app.id = app._id;
        app = omit(app, ['triggers', 'actions', '_id']);

        return Object.assign({}, action, { app, triggers });
      });
  }

  static list(appId, options) {
    return appsDb.findOne({ _id: appId })
      .then(app => (app && app.actions ? app.actions : []))
      .then(actions => {
        if (options && options.filter && options.filter.by === 'name') {
          const comparableName = options.filter.value.trim().toLowerCase();
          return actions.filter(a => comparableName === a.name.trim().toLowerCase());
        } else if (options && options.filter && options.filter.by === 'id') {
          return actions.filter(a => options.filter.value.indexOf(a.id) !== -1);
        }
        return actions;
      })
      .then(actions => projectOutputOnFields(actions, options.project));
  }

  static listRecent() {
    return indexerDb.findOne({ _id: RECENT_ACTIONS_ID })
      .then(all => (all && all.actions ? all.actions : []));
  }

  static remove(actionId) {
    return appsDb.update(
      { 'actions.id': actionId },
      { $pull: { actions: { id: actionId } } },
    ).then(numRemoved => {
      const wasDeleted = numRemoved > 0;
      if (wasDeleted) {
        return Promise.all([
          removeFromRecent('id', actionId),
          HandlersManager.removeByActionId(actionId),
        ])
          .then(() => wasDeleted);
      }
      return wasDeleted;
    });
  }

  /* @deprecated - Using old model of action JSON and not being used in the application*/
  static exportToFlow(actionId) {
    return ActionsManager.findOne(actionId)
      .then(action => {
        if (!action) {
          throw ErrorManager.makeError('Action not found', { type: ERROR_TYPES.COMMON.NOT_FOUND });
        }

        const flow = get(action, 'data.flow', {});
        flow.attributes = flow.attributes || [];
        flow.name = action.name;
        // todo: extract constant
        flow.model = 'tibco-simple';
        // todo: extract constant
        flow.type = flow.type || 1;

        const trigger = {
          ref: action.trigger.ref,
          settings: action.trigger.settings,
          endpoints: [{
            actionType: 'flow',
            settings: action.handler.settings,
          }],
        };

        const tasks = get(flow, 'rootTask.tasks', []);

        // hardcoding the activity type, for now
        // TODO: maybe the activity should expose a property so we know it can reply?
        const hasExplicitReply = tasks.find(t => t.activityRef === 'github.com/TIBCOSoftware/flogo-contrib/activity/reply');
        if (hasExplicitReply) {
          flow.explicitReply = true;
        }

        return Promise.all([
          ContribTriggersManager.findByRef(trigger.ref)
            .then(contribTrigger => {
              trigger.name = contribTrigger.name;
            }),
          Promise.resolve(true),
          // ContribActivitiesManager.find()
          //   .then(contribActivities => new Map(contribActivities.map(a => [a.ref, a.name])))
          //   .then(contribActivities => {
          //     const tasks = flow.tasks || [];
          //     tasks.forEach(t => {
          //       t.activityType = contribActivities.get(t.ref);
          //     });
          //   }),
        ])
          .then(() => ({
            flow,
            trigger,
          }));
      });
  }

  static removeFromRecentByAppId(appId) {
    return removeFromRecent('appId', appId);
  }

}

function atomicUpdate(actionFields, actionId, appId) {
  return new Promise((resolve, reject) => {
    const appQuery = { _id: appId };
    const updateQuery = {};

    const createUpdateQuery = (err, app) => {
      if (err) {
        return reject(err);
      } else if (!app) {
        return reject(ErrorManager.makeError('App not found', { type: ERROR_TYPES.COMMON.NOT_FOUND }));
      }

      if (actionFields.name) {
        const nameExists = actions => {
          const comparableName = actionFields.name.trim().toLowerCase();
          return !!actions.find(
            t => t.name.trim().toLowerCase() === comparableName && t.id !== actionId,
          );
        };
        if (nameExists(app.actions)) {
          // do nothing
          return reject(ErrorManager.createValidationError('Validation error', [{
            property: 'name',
            title: 'Name already exists',
            detail: 'There\'s another action in the app with this name',
            value: {
              actionId,
              appId: app.id,
              name: actionFields.name,
            },
            type: CONSTRAINTS.UNIQUE,
          }]));
        }
      }

      const actionIndex = app.actions.findIndex(t => t.id === actionId);
      actionFields.updatedAt = dbUtils.ISONow();
      Object.assign(updateQuery, prepareUpdateQuery(actionFields, app.actions[actionIndex], actionIndex));
      return null;
    };

    // queue find and update operation to nedb to make sure they execute one after the other
    // and no other operation is mixed between them
    appsDb.collection.findOne(appQuery, { actions: 1 }, createUpdateQuery);
    // appsDb.collection.update(appQuery, updateQuery1);
    appsDb.collection.update(appQuery, updateQuery, {},
      (err, updatedCount) => (err ? reject(err) : resolve(updatedCount)));
  });
}

function storeAsRecent(withAction) {
  const findQuery = { _id: RECENT_ACTIONS_ID };
  const updateQuery = {};

  return new Promise((resolve, reject) => {
    indexerDb.collection.findOne(findQuery, (error, recentActions) => {
      if (error) {
        reject(error);
        return;
      }

      recentActions = recentActions || { actions: [] };
      const oldActions = recentActions.actions;

      const existingActionIndex = oldActions.findIndex(a => a.id === withAction.id);
      if (existingActionIndex > -1) {
        oldActions.splice(existingActionIndex, 1);
      }

      const newRecentActions = [withAction, ...oldActions.slice(0, MAX_RECENT)];

      updateQuery.$set = { actions: newRecentActions };
    });
    indexerDb.collection.update(findQuery, updateQuery, { upsert: true }, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function removeFromRecent(compareField, fieldVal) {
  if (!['id', 'appId'].includes(compareField)) {
    throw new TypeError('Field can only be id or appId');
  }

  const findQuery = { _id: RECENT_ACTIONS_ID };
  const updateQuery = {};
  if (compareField === 'id') {
    findQuery['actions.id'] = fieldVal;
    updateQuery.$pull = { actions: { id: fieldVal } };
  } else {
    findQuery['actions.appId'] = fieldVal;
    updateQuery.$pull = { actions: { appId: fieldVal } };
  }

  return indexerDb.findOne(findQuery)
    .then(result => {
      if (result) {
        return indexerDb.update(findQuery, updateQuery, {});
      }
      return null;
    });
}

function cleanInput(action, fields) {
  const cleanAction = pick(action, fields);
  if (cleanAction.name) {
    cleanAction.name = cleanAction.name.trim();
  }
  return cleanAction;
}


function ensureUniqueName(actions, name) {
  const greatestIndex = findGreatestNameIndex(name, actions);
  if (greatestIndex >= 0) {
    name = `${name} (${greatestIndex + 1})`;
  }
  return name;
}

function projectOutputOnFields(actionArray, fields) {
  if (fields && fields.length > 0) {
    fields.push('id');
    return actionArray.map(action => pick(action, fields));
  }
  return actionArray;
}
