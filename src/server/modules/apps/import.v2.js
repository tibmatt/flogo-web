import cloneDeep from 'lodash/cloneDeep';

import { ErrorManager, ERROR_TYPES } from '../../common/errors';
import { Validator } from './validator';

import { AppsManager } from './index.v2';
import { AppsTriggersManager } from './triggers';
import { HandlersManager } from './handlers';
import { ActionsManager } from '../actions';

import { ActivitiesManager as ContribActivitiesManager } from '../activities';
import { TriggerManager as ContribTriggersManager } from '../triggers';
import { ContribsManager as ContribDeviceManager } from '../contribs';
import {FLOGO_PROFILE_TYPES} from "../../common/constants";
import {getProfileType} from "../../common/utils/profile";

export function importApp(fromApp) {
  const clonedApp = cloneDeep(fromApp);
  const appProfile = getProfileType(fromApp);
  // TODO: apply unique names to tasks
  return getInstalledActivitiesAndTriggers(appProfile)
    .then(installedContribs => {
      const errors = Validator.validateFullApp(appProfile, clonedApp, installedContribs,
        { removeAdditional: true, useDefaults: true });
      if (errors && errors.length > 0) {
        throw ErrorManager.createValidationError('Validation error', { details: errors });
      }
    })
    .then(() => AppsManager.create(clonedApp))
    .then(app => {
      return ContribDeviceManager.find({type:'flogo:device:activity'})
        .then(activityContribs => {
          if(appProfile === FLOGO_PROFILE_TYPES.DEVICE) {
            fromApp.triggers = fromApp.triggers.map(trigger => deviceTriggerFormatter(trigger));
            fromApp.actions = fromApp.actions.map(action => deviceActionFormatter(action, activityContribs));
          }
          const groups = makeActionGroups(fromApp.triggers, fromApp.actions);
          return chainPromises(groups.triggerGroups, g => registerTriggerGroup(app.id, g))
            .then(() => chainPromises(groups.orphans, action => ActionsManager.create(app.id, action)))
            .then(() => AppsManager.findOne(app.id));
        });
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

function getInstalledActivitiesAndTriggers(profileType) {
  const mapRefs = contribs => contribs.map(c => c.ref);
  let contribPromise;
  if(profileType === FLOGO_PROFILE_TYPES.MICRO_SERVICE){
    contribPromise = Promise.all([
      ContribTriggersManager.find().then(mapRefs),
      ContribActivitiesManager.find().then(mapRefs),
    ]);
  } else {
    contribPromise = Promise.all([
      ContribDeviceManager.find({type:'flogo:device:trigger'}).then(mapRefs),
      ContribDeviceManager.find({type:'flogo:device:activity'}).then(mapRefs)
    ]);
  }
  return contribPromise.then(([triggers, activities]) => ({ triggers, activities }));
}

function deviceTriggerFormatter(trigger){
  trigger.handlers = [];
  trigger.handlers.push({
    "settings": {},
    actionId: trigger.actionId
  });
  return trigger;
}

function deviceActionFormatter(action, installedActivities){
  if(!action.name) {
    action.name = action.id;
  }
  if(action.data.flow){
    action.data.flow.rootTask = {
      id: 1,
      type: 1,
      links: cloneDeep(action.data.flow.links),
      tasks: cloneDeep(action.data.flow.tasks)
    };
    action.data.flow.rootTask.tasks = action.data.flow.rootTask.tasks.map(function(task){
      let attributesArray = cloneDeep(installedActivities.find(activity => activity.ref === task.activityRef).settings);
      attributesArray = attributesArray.map(function(attribute){
        attribute.value = "";
        if(task.attributes[attribute.name]){
          attribute.value = task.attributes[attribute.name]
        }
        return attribute;
      });
      task.attributes = attributesArray;
      return task;
    });
    action.data.flow.attributes = [];
    delete(action.data.flow.tasks);
    delete(action.data.flow.links);
  }
  return action;
}

/*

It is not used for the time being as our activities contribution fetching api's do not have activityRef

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
}*/
