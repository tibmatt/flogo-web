'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installAndConfigureTasks = installAndConfigureTasks;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

require('babel-polyfill');

var _appConfig = require('../../config/app-config');

var _activities = require('../activities');

var _triggers = require('../triggers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Server start logic
 *
 * 1. register default activities and triggers.
 * 2. initialise the default engine (the test engine) and build engine.
 * 3. start the test engine.
 * 4. configure the server and start listening
 */

function installAndConfigureTasks() {
  var registerActivitiesPromise = function () {
    return new Promise(function (resolve, reject) {
      var reg = new _activities.RegisterActivities(_appConfig.activitiesDBService, {
        defaultPath: _path2.default.resolve(_appConfig.config.rootPath, _appConfig.config.activities.defaultPath),
        defaultConfig: _appConfig.config.activities.default,
        customPath: _path2.default.resolve(_appConfig.config.rootPath, _appConfig.config.activities.contribPath),
        customConfig: _appConfig.config.activities.contrib
      });

      return reg.register().then(function () {
        console.log("[success]registerActivities success");
        resolve(true);
      }).catch(function (err) {
        console.log("[error]registerActivities error");
        reject(err);
      });
    });
  }();

  var registerTriggersPromise = function () {
    return new Promise(function (resolve, reject) {
      var reg = new _triggers.RegisterTriggers(_appConfig.triggersDBService, {
        defaultPath: _path2.default.resolve(_appConfig.config.rootPath, _appConfig.config.triggers.defaultPath),
        defaultConfig: _appConfig.config.triggers.default,
        customPath: _path2.default.resolve(_appConfig.config.rootPath, _appConfig.config.triggers.contribPath),
        customConfig: _appConfig.config.triggers.contrib
      });

      return reg.register().then(function () {
        console.log("[success]registerTriggers success");
        resolve(true);
      }).catch(function (err) {
        console.log("[error]registerTriggers error");
        reject(err);
      });
    });
  }();

  return Promise.all([registerActivitiesPromise, registerTriggersPromise]);
}