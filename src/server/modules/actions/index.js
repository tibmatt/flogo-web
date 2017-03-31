import pick from 'lodash/pick';
import omit from 'lodash/omit';
import mapKeys from 'lodash/mapKeys';

import { apps as appsDb, indexer as indexerDb, dbUtils } from '../../common/db';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';
import { CONSTRAINTS } from '../../common/validation';
import { Validator } from './validator';

import { HandlersManager } from '../apps/handlers';

import { findGreatestNameIndex } from '../../common/utils/collection';

const EDITABLE_FIELDS_CREATION = [
  'name',
  'description',
  'data',
];

const EDITABLE_FIELDS_UPDATE = [
  'name',
  'description',
  'data',
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
          throw ErrorManager.createValidationError('Validation error', errors);
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
          .then(() => {
            newAction.appId = appId;
            return storeAsRecent(newAction);
          })
          .then(() => ActionsManager.findOne(newAction.id));
      });
  }

  static update(actionId, actionData) {
    return ActionsManager.findOne(actionId)
      .then(existingAction => {
        if (!existingAction) {
          throw ErrorManager.makeError('App not found', { type: ERROR_TYPES.COMMON.NOT_FOUND });
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

        let handler = null;
        const trigger = app.triggers.find(t => {
          const h = t.handlers.find(a => a.actionId === actionId);
          if (h) {
            handler = h;
          }
          return h;
        }) || null;

        app.id = app._id;
        app = omit(app, ['triggers', 'actions', '_id']);

        return Object.assign({}, action, { app, handler, trigger });
      });
  }

  static list(appId) {
    return appsDb.findOne({ _id: appId })
      .then(app => (app && app.actions ? app.actions : []));
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
      const modifierPrefix = `actions.${actionIndex}`;
      actionFields.updatedAt = dbUtils.ISONow();
      // makes { $set: { 'actions.1.name': 'my action' } };
      updateQuery.$set = mapKeys(actionFields, (v, fieldName) => `${modifierPrefix}.${fieldName}`);
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
