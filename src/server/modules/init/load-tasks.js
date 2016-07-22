import _ from 'lodash';

import {
  config,
  activitiesDBService,
  triggersDBService
} from '../../config/app-config';
import {getInitialisedTestEngine, getInitialisedBuildEngine} from '../engine';


export function loadTasksToEngines() {

  let allInstalledActivities;
  let allInstalledTriggers;

  return Promise.all([
    loadInstalledActivities().then(activities => allInstalledActivities = activities),
    loadInstalledTriggers().then(triggers => allInstalledTriggers = triggers)
  ])
    .then(() => console.log('Loaded all activities and triggers'))
    .then(() => {
      return getInitialisedTestEngine()
        .then(testEngine => {
          return loadToEngine(testEngine, allInstalledActivities, allInstalledTriggers, config.testEngine.installConfig);
        });
    })
    .then(() => {
      return getInitialisedBuildEngine()
        .then(buildEngine => {
          return loadToEngine(buildEngine, allInstalledActivities, allInstalledTriggers, config.buildEngine.installConfig);
        });
    });

}

function loadToEngine(engine, activities, triggers, installConfig) {
  engine.installedActivites = _.cloneDeep(activities);
  engine.installedTriggers = _.cloneDeep(_.omitBy(triggers, (data, triggerName) => {
    return installConfig[triggerName] && installConfig[triggerName].ignore;
  }));
  return engine;
}

function loadInstalledActivities() {
  return activitiesDBService.allDocs()
  // => {activityName: {path, version}}
    .then(mapTasks);
}

function loadInstalledTriggers() {
  return triggersDBService.allDocs()
  // => {triggerName: {path, version}}
    .then(mapTasks);
}

function mapTasks(tasks) {
  return _.chain(tasks)
    .keyBy('name')
    .mapValues(task => ({path: task.where, version: task.version}))
    .value();
}
