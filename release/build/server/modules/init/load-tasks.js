'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadTasksToEngines = loadTasksToEngines;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appConfig = require('../../config/app-config');

var _engine = require('../engine');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadTasksToEngines() {

  var allInstalledActivities = void 0;
  var allInstalledTriggers = void 0;

  return Promise.all([loadInstalledActivities().then(function (activities) {
    return allInstalledActivities = activities;
  }), loadInstalledTriggers().then(function (triggers) {
    return allInstalledTriggers = triggers;
  })]).then(function () {
    return console.log('Loaded all activities and triggers');
  }).then(function () {
    return (0, _engine.getInitialisedTestEngine)().then(function (testEngine) {
      return loadToEngine(testEngine, allInstalledActivities, allInstalledTriggers, _appConfig.config.testEngine.installConfig);
    });
  }).then(function () {
    return (0, _engine.getInitialisedBuildEngine)().then(function (buildEngine) {
      return loadToEngine(buildEngine, allInstalledActivities, allInstalledTriggers, _appConfig.config.buildEngine.installConfig);
    });
  });
}

function loadToEngine(engine, activities, triggers, installConfig) {
  engine.installedActivites = _lodash2.default.cloneDeep(activities);
  engine.installedTriggers = _lodash2.default.cloneDeep(_lodash2.default.omitBy(triggers, function (data, triggerName) {
    return installConfig[triggerName] && installConfig[triggerName].ignore;
  }));
  return engine;
}

function loadInstalledActivities() {
  return _appConfig.activitiesDBService.allDocs()
  // => {activityName: {path, version}}
  .then(mapTasks);
}

function loadInstalledTriggers() {
  return _appConfig.triggersDBService.allDocs()
  // => {triggerName: {path, version}}
  .then(mapTasks);
}

function mapTasks(tasks) {
  return _lodash2.default.chain(tasks).keyBy('name').mapValues(function (task) {
    return { path: task.where, version: task.version };
  }).value();
}