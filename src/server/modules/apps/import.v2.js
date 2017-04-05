import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import get from 'lodash/get';

import { ErrorManager, ERROR_TYPES } from '../../common/errors';
import { Validator } from './validator';

import { AppsManager } from './index.v2';
import { AppsTriggersManager } from './triggers';
import { HandlersManager } from './handlers';
import { ActionsManager } from '../actions';

import { ActivitiesManager as ContribActivitiesManager } from '../activities';
import { TriggerManager as ContribTriggersManager } from '../triggers';

export function importApp(fromApp) {
  const clonedApp = cloneDeep(fromApp);
  // TODO: apply unique names to tasks
  return getInstalledActivitiesAndTriggers(fromApp)
    .then(installedContribs => {
      const errors = Validator.validateFullApp(clonedApp, installedContribs,
        { removeAdditional: true, useDefaults: true });
      if (errors && errors.length > 0) {
        throw ErrorManager.createValidationError('Validation error', { details: errors });
      }
    })
    .then(() => AppsManager.create(clonedApp))
    .then(app => {
      const groups = makeActionGroups(fromApp.triggers, fromApp.actions);
      return chainPromises(groups.triggerGroups, g => registerTriggerGroup(app.id, g))
        .then(() => chainPromises(groups.orphans, action => ActionsManager.create(app.id, action)))
        .then(() => AppsManager.findOne(app.id));
    });
}

function makeActionGroups(triggers, actions) {
  const actionMap = new Map(actions.map(a => [a.id, a]));

  const pullAction = actionId => {
    const action = actionMap.get(actionId);
    if (action) {
      actionMap.delete(actionId);
    }
    return action;
  };

  const triggerGroups = triggers.map(trigger => ({
    trigger,
    handlers: trigger.handlers
      .map(handler => ({ handler, action: pullAction(handler.actionId) }))
      .filter(h => !!h.action),
  })).filter(triggerGroup => triggerGroup.handlers.length > 0);

  // orphan flows
  const orphans = Array.from(actionMap.values());
  return { triggerGroups, orphans };
}

function registerTriggerGroup(appId, { trigger, handlers }) {
  if (!trigger.name) {
    trigger.name = trigger.id;
  }
  return AppsTriggersManager.create(appId, trigger)
    .then(savedTrigger => chainPromises(handlers,
      handlerGroup => ActionsManager.create(appId, handlerGroup.action)
        .then(action => HandlersManager.save(savedTrigger.id, action.id, handlerGroup.handler))),
    );
}

function chainPromises(from, thenDo) {
  return from.reduce((promiseChain, e) => promiseChain.then(() => thenDo(e)), Promise.resolve(true));
}

function getInstalledActivitiesAndTriggers(app) {
  const allRefs = extractRefs(app);
  const mapRefs = contribs => contribs.map(c => c.ref);
  return Promise.all([
    ContribTriggersManager.find(allRefs.triggers).then(mapRefs),
    ContribActivitiesManager.find(mapRefs).then(mapRefs),
  ]).then(([triggers, activities]) => ({ triggers, activities }));
}

export function extractRefs(app) {
  const allRefs = { triggers: [], activities: [] };
  const triggerRefMap = new Map();
  const triggers = isArray(app.triggers) ? app.triggers : [];

  triggers.forEach(t => {
    if (isObject(t) && t.ref && !triggerRefMap.get(t.ref)) {
      triggerRefMap.set(t.ref, true);
    }
  });
  allRefs.triggers = Array.from(triggerRefMap.keys());

  const activityRefMap = new Map();
  const actions = isArray(app.actions) ? app.actions : [];
  actions.forEach(a => {
    const tasks = get(a, 'data.flow.rootTask.tasks', [])
      .concat(a, 'data.flow.errorHandler.tasks', []);
    tasks.forEach(t => {
      if (isObject(t) && t.ref && !activityRefMap.get(t.activityRef)) {
        activityRefMap.set(a.activityRef, true);
      }
    });
  });
  allRefs.activities = Array.from(activityRefMap.keys());
  return allRefs;
}
