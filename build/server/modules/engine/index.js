'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Engine = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getTestEngine = getTestEngine;
exports.initTestEngine = initTestEngine;
exports.getInitialisedTestEngine = getInitialisedTestEngine;
exports.getBuildEngine = getBuildEngine;
exports.initBuildEngine = initBuildEngine;
exports.getInitialisedBuildEngine = getInitialisedBuildEngine;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appConfig = require('../../config/app-config');

var _utils = require('../../common/utils');

var _constants = require('../../common/constants');

var _commands = require('./commands');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var execSync = require('child_process').execSync;
var fs = require('fs');

var NO_ENGINE_RECREATION = !!process.env.FLOGO_NO_ENGINE_RECREATION;

//TODO: make sync function to async

var Engine = exports.Engine = function () {
  /**
   * constructor function of Engine
   * @param {object} options - the configuration of engine
   * @param {string} options.name - the name of this engine
   * @param {string} options.path - the root path to this engine
   * @param {number} options.port - the port of this engine
   * @return {Engine} - return Engine instance
   */

  function Engine(options) {
    _classCallCheck(this, Engine);

    this.options = _lodash2.default.cloneDeep(options);
    // The path to this engine.
    this.enginePath = _path2.default.join(_appConfig.config.rootPath, this.options.path);
    // Installed activities
    this.installedActivites = {};
    // Installed triggers
    this.installedTriggers = {};
    // Installed models
    // TODO for now, model is installed by engine default, so this object is empty
    this.installedModels = {};
    // Installed flow
    this.installedFlows = {};

    // currently engine is started or not
    this.isStarted = false;

    // if the current engine is running internal tasks such as adding activity,
    // namely, the engine is down and unable to serve
    this.isProcessing = false;

    return this;
  }

  _createClass(Engine, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var initPromise = Promise.resolve(true);
      if (!NO_ENGINE_RECREATION) {
        initPromise = initPromise.then(function () {
          console.log('[log] Start remove enginge...');
          return _this.removeEngine();
        });
      }

      return initPromise.then(function () {
        return _this.createEngine();
      }).then(function () {
        return _this;
      });
    }
  }, {
    key: 'removeEngine',


    /**
     * Stop engine and remove it
     * @return {Promise<boolean>} if remove successful, return true, otherwise return false
     */
    value: function removeEngine() {
      var self = this;
      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          self.isProcessing = false;
          self.status = _constants.FLOGO_ENGINE_STATUS.REMOVED;
          console.log('[log] Removed enginde "' + self.options.name + '"');
          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          console.error("[error] Engine->removeEngine. Error: ", err);
          self.isProcessing = false;
          reject(false);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.REMOVING;
        var engineFolder = _path2.default.join(self.enginePath, self.options.name);

        // if engine is running stop it
        self.stop().then(function () {
          // remove the engine folder
          if ((0, _utils.isExisted)(engineFolder)) {
            return (0, _utils.runShellCMD)('rm', ['-rf', engineFolder]);
          }
        }).then(successHandler).catch(errorHandler);
      });
    }

    /**
     * Create an engine
     * @return {Promise<boolean>} if create successful, return true, otherwise return false
     */

  }, {
    key: 'createEngine',
    value: function createEngine() {
      var self = this;

      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          self.isProcessing = false;
          self.status = _constants.FLOGO_ENGINE_STATUS.CREATED;
          resolve(true);
        };

        // TODO: workaround to prevent engine recreation
        if (NO_ENGINE_RECREATION) {
          return successHandler();
        }

        var errorHandler = function errorHandler(err) {
          console.error("[error] Engine->createEngine. Error: ", err);

          self.isProcessing = false;
          reject(false);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.CREATING;

        (0, _utils.runShellCMD)('flogo', ['create', self.options.name], {
          cwd: self.enginePath
        }).then(successHandler).catch(errorHandler);
      });
    }

    /**
     * [addAllActivities description]
     * @param {[type]} options [description]
     */

  }, {
    key: 'addAllActivities',
    value: function addAllActivities(options) {
      var self = this;
      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          self.isProcessing = false;
          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          self.isProcessing = false;
          reject(err);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.ADDING_ACTIVITY;

        _appConfig.activitiesDBService.allDocs().then(function (activities) {

          options = options || [];
          activities = activities || [];

          return new Promise(function (resolve, reject) {

            var processedItemNum = 0;
            var runResult = [];

            function _sequentiallyRun() {

              var activity = activities[processedItemNum];

              processedItemNum++;

              var promise = null;

              activity = activity || {};

              var ignore = options[activity.name] && options[activity.name].ignore || false;

              if (activity.where) {
                if (!ignore) {
                  promise = self.addActivity(activity.name, activity.where, activity.version);
                } else {
                  console.log("[info] ignore");
                  promise = Promise.resolve(true);
                }
              } else {
                console.error("[error]", activity.name, " where isn't defined");
                promise = Promise.resolve(false);
              }

              return promise.then(function (result) {
                if (result !== false && !_lodash2.default.isNil(result)) {
                  runResult.push(true);
                } else {
                  runResult.push(false);
                }

                if (processedItemNum >= activities.length) {
                  console.log('[log] add all activities result:');
                  console.log(runResult);
                  resolve(true);
                } else {
                  return _sequentiallyRun();
                }
              });
            }

            _sequentiallyRun().catch(function (err) {
              console.log('[error] add all activities -> sequentiallyRun on error: ');
              console.error(err);
              reject(err);
            });
          }).then(successHandler);
        }).catch(function (err) {
          console.error("[error] activitiesDBService.allDocs(), err: ", err);
          errorHandler(err);
        });
      });
    }

    /**
     * [addAllTriggers description]
     * @param {[type]} options [description]
     */

  }, {
    key: 'addAllTriggers',
    value: function addAllTriggers(options) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var successHandler = function successHandler() {
          self.isProcessing = false;
          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          self.isProcessing = false;
          reject(err);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.ADDING_TRIGGER;

        _appConfig.triggersDBService.allDocs().then(function (triggers) {

          options = options || [];
          triggers = triggers || [];

          return new Promise(function (resolve, reject) {

            var processedItemNum = 0;
            var runResult = [];

            function _sequentiallyRun() {

              var trigger = triggers[processedItemNum];

              processedItemNum++;

              var promise = null;

              trigger = trigger || {};

              var ignore = options[trigger.name] && options[trigger.name].ignore || false;

              if (trigger.where) {
                if (!ignore) {
                  promise = self.addTrigger(trigger.name, trigger.where, trigger.version);
                } else {
                  console.log("[info] ignore");
                  promise = Promise.resolve(true);
                }
              } else {
                console.error("[error]", trigger.name, " where isn't defined");
                promise = Promise.resolve(false);
              }

              return promise.then(function (result) {
                if (result !== false && !_lodash2.default.isNil(result)) {
                  runResult.push(true);
                } else {
                  runResult.push(false);
                }

                if (processedItemNum >= triggers.length) {
                  console.log('[log] add all triggers result:');
                  console.log(runResult);
                  resolve(true);
                } else {
                  return _sequentiallyRun();
                }
              });
            }

            _sequentiallyRun().catch(function (err) {
              console.log('[error] add all triggers -> sequentiallyRun on error: ');
              console.error(err);
              reject(err);
            });
          }).then(successHandler);
        }).catch(function (err) {
          console.error("[error] triggersDBService.allDocs(), err: ", err);
          errorHandler(err);
        });
      });
    }

    /**
     * Add an activity to the engine
     * @param {string} activityName - the name of this activity.
     * @param {string} activityPath - the path of this activity.
     * @param {string} activityVersion - the version of this activity.
     * @return {Promise<boolean>} if create successful, return true, otherwise return false
     */

  }, {
    key: 'addActivity',
    value: function addActivity(activityName, activityPath, activityVersion) {
      var self = this;

      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          self.installedActivites[activityName] = {
            path: activityPath,
            version: activityVersion // leave the version to be undefined, if not provided.
          };

          self.isProcessing = false;
          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          console.error("[error] Engine->addActivity. Error: ", err);

          self.isProcessing = false;
          reject(false);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.ADDING_ACTIVITY;

        var defaultEnginePath = _path2.default.join(self.enginePath, self.options.name);

        (0, _utils.runShellCMD)('flogo', ['add', 'activity', activityPath], {
          cwd: defaultEnginePath
        }).then(successHandler).catch(errorHandler);
      });
    }

    /**
     * Check if an activity has been added to the engine
     * @param {string} activityName - the name of this activity.
     * @param {string} activityPath - the path of this activity.
     * @return {Object}
     *
     * {
     *    exists: boolean, // true if the activity name exists
     *    samePath: boolean // true if the path is the same
     * }
     *
     */

  }, {
    key: 'hasActivity',
    value: function hasActivity(activityName, activityPath) {
      var activity = this.installedActivites[activityName];
      var exists = !_lodash2.default.isNil(activity);

      return {
        exists: exists,
        samePath: exists && activity.path === activityPath,
        version: exists ? activity.version : {}['just need an undefined']
      };
    }

    /**
     * Add an trigger to the engine
     * @param {string} triggerName - the name of this trigger.
     * @param {string} triggerPath - the path of this trigger.
     * @param {string} triggerVersion - the version of this trigger.
     * @return {boolean} if create successful, return true, otherwise return false
     */

  }, {
    key: 'addTrigger',
    value: function addTrigger(triggerName, triggerPath, triggerVersion) {
      var self = this;

      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          self.installedTriggers[triggerName] = {
            path: triggerPath,
            version: triggerVersion // leave the version to be undefined, if not provided.
          };

          self.isProcessing = false;
          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          console.error("[error] Engine->addTrigger. Error: ", err);

          self.isProcessing = false;
          reject(false);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.ADDING_TRIGGER;

        var defaultEnginePath = _path2.default.join(self.enginePath, self.options.name);

        (0, _utils.runShellCMD)('flogo', ['add', 'trigger', triggerPath], {
          cwd: defaultEnginePath
        }).then(successHandler).catch(errorHandler);
      });
    }

    /**
     * Check if an trigger has been added to the engine
     * @param {string} triggerName - the name of this trigger.
     * @param {string} triggerPath - the path of this trigger.
     * @return {Object}
     *
     * {
     *    exists: boolean, // true if the trigger name exists
     *    samePath: boolean // true if the path is the same
     * }
     *
     */

  }, {
    key: 'hasTrigger',
    value: function hasTrigger(triggerName, triggerPath) {
      var trigger = this.installedTriggers[triggerName];
      var exists = !_lodash2.default.isNil(trigger);

      return {
        exists: exists,
        samePath: exists && trigger.path === triggerPath,
        version: exists ? trigger.version : {}['just need an undefined']
      };
    }

    /**
     * Add an model to the engine
     * @param {string} modelName - the name of this model.
     * @param {string} modelPath - the path of this model.
     * @return {boolean} if create successful, return true, otherwise return false
     */

  }, {
    key: 'addModel',
    value: function addModel(modelName, modelPath) {
      try {
        this.isProcessing = true;
        this.status = _constants.FLOGO_ENGINE_STATUS.ADDING_MODEL;

        var _defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo add model ' + modelPath);

        // TODO sync to async
        execSync('flogo add model ' + modelPath, {
          cwd: _defaultEnginePath
        });

        this.installedModels[modelName] = {
          path: modelPath
        };

        this.isProcessing = false;
        return true;
      } catch (err) {
        console.error("[Error]Engine->addModel. Error: ", err);

        this.isProcessing = false;
        return false;
      }
    }

    /**
     * Add a flow to engine
     * @param {string|Path} flowPath - the path to flow json
     * @param {string} [flowName] - the name of this flow
     * @return {boolean} if successful, return true, otherwise return false
     */

  }, {
    key: 'addFlow',
    value: function addFlow(flowPath, flowName) {
      try {
        this.isProcessing = true;
        this.status = _constants.FLOGO_ENGINE_STATUS.ADDING_FLOW;

        var _defaultEnginePath2 = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo add flow ' + flowPath);
        if (!flowName) {
          var parseResult = _path2.default.parse(flowPath);
          flowName = parseResult.name;
        }
        console.log("[info][Engine->addFlow] flowName: ", flowName);

        // TODO sync to async
        execSync('flogo add flow ' + flowPath, {
          cwd: _defaultEnginePath2
        });
        this.installedFlows[flowName] = {
          path: flowPath
        };

        this.isProcessing = false;
        return flowName;
      } catch (err) {
        console.error("[Error]Engine->addFlow. Error: ", err);

        this.isProcessing = false;
        return false;
      }
    }

    /**
     * Delete an activity in this engine
     * @param {string} activityName - the name of activity
     * @return {Promise<boolean>} if successful, return true, otherwise return false
     */

  }, {
    key: 'deleteActivity',
    value: function deleteActivity(activityName) {
      var self = this;

      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          delete self.installedActivites[activityName];

          self.isProcessing = false;
          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          console.error("[error] Engine->deleteActivity. Error: ", err);

          self.isProcessing = false;
          reject(false);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.REMOVING_ACTIVITY;

        var defaultEnginePath = _path2.default.join(self.enginePath, self.options.name);

        (0, _utils.runShellCMD)('flogo', ['del', 'activity', activityName], {
          cwd: defaultEnginePath
        }).then(successHandler).catch(errorHandler);
      });
    }

    /**
     * Delete a trigger in this engine
     * Also update the trigger.json to remove the entry of this trigger.
     * @param {string} triggerName - the name of trigger
     * @param {boolean} keepConfig - keep the configuration of the trigger, using with an add trigger call for updating.
     * @return {boolean} if successful, return true, otherwise return false
     */

  }, {
    key: 'deleteTrigger',
    value: function deleteTrigger(triggerName, keepConfig) {
      var self = this;

      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          delete self.installedTriggers[triggerName];

          self.isProcessing = false;
          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          console.error("[error] Engine->deleteTrigger. Error: ", err);

          self.isProcessing = false;
          reject(false);
        };

        // update the trigger.json to remove the entry of this trigger,
        // since the `flogo del` won't do that.
        var removeTriggerInfoFromTriggersJSON = function removeTriggerInfoFromTriggersJSON() {
          var triggersJSONPath = _path2.default.join(defaultEnginePath, 'bin', 'triggers.json');

          return (0, _utils.readJSONFile)(triggersJSONPath).then(function (triggersData) {
            // console.log( '[TODO] engine -> deleteTrigger | original triggersData:' );
            // inspectObj( triggersData );

            _lodash2.default.remove(triggersData.triggers, function (trigger) {
              return trigger.name === triggerName;
            });

            // console.log( '[TODO] engine -> deleteTrigger | modified triggersData:' );
            // inspectObj( triggersData );

            return triggersData;
          }).then(function (triggersData) {
            return (0, _utils.writeJSONFile)(triggersJSONPath, triggersData);
          });
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.REMOVING_TRIGGER;

        var defaultEnginePath = _path2.default.join(self.enginePath, self.options.name);

        (0, _utils.runShellCMD)('flogo', ['del', 'trigger', triggerName], {
          cwd: defaultEnginePath
        }).then(function () {
          if (!keepConfig) {
            return removeTriggerInfoFromTriggersJSON();
          }
        }).then(successHandler).catch(errorHandler);
      });
    }

    /**
     * Delete a model in this engine
     * @param {string} modelName - the name of model
     * @return {boolean} if successful, return true, otherwise return false
     */

  }, {
    key: 'deleteModel',
    value: function deleteModel(modelName) {
      try {
        this.isProcessing = true;
        this.status = _constants.FLOGO_ENGINE_STATUS.REMOVING_MODEL;

        var _defaultEnginePath3 = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo del model ' + modelName);

        // TODO sync to async
        execSync('flogo del model ' + modelName, {
          cwd: _defaultEnginePath3
        });

        delete this.installedModels[modelName];

        this.isProcessing = false;
        return true;
      } catch (err) {
        console.error("[Error]Engine->deleteModel. Error: ", err);

        this.isProcessing = false;
        return false;
      }
    }

    /**
     * Delete a flow to engine
     * @param {string} flowName - the name of this flow
     * @return {boolean} if successful, return true, otherwise return false
     */

  }, {
    key: 'deleteFlow',
    value: function deleteFlow(flowName) {
      try {
        this.isProcessing = true;
        this.status = _constants.FLOGO_ENGINE_STATUS.REMOVING_FLOW;

        var _defaultEnginePath4 = _path2.default.join(this.enginePath, this.options.name);
        var flow = 'embedded://' + flowName;
        console.log('[info]flogo del flow ' + flow);

        // TODO sync to async
        execSync('flogo del flow ' + flow, {
          cwd: _defaultEnginePath4
        });

        delete this.installedFlows[flowName];

        this.isProcessing = false;
        return true;
      } catch (err) {
        console.error("[Error]Engine->deleteFlow. Error: ", err);

        this.isProcessing = false;
        return false;
      }
    }

    /**
     * Add a flow to engine
     * @param {string|Path} flowPath - the path to flow json
     * @param {string} [flowName] - the name of this flow
     * @return {boolean} if successful, return true, otherwise return false
     */

  }, {
    key: 'deleteAllFlows',
    value: function deleteAllFlows() {
      var _this2 = this;

      try {
        this.isProcessing = true;
        this.status = _constants.FLOGO_ENGINE_STATUS.REMOVING_FLOW;

        var flowNames = _lodash2.default.keys(this.installedFlows);
        flowNames.forEach(function (flowName) {
          _this2.deleteFlow(flowName);
        });

        this.isProcessing = false;
        return true;
      } catch (err) {
        console.error("[Error]Engine->deleteAllFlows. Error: ", err);

        this.isProcessing = false;
        return false;
      }
    }

    /**
     * update the config.json file in the engine/bin folder
     * @param {object} options - the json object for config.json. Default it will merge with config.json then write to config.json
     * @param {boolean} [overwrite=false] - whether use options to overwrite whole config.json. This means options == config.json
     * @return {boolean} success: true, fail: false
     */

  }, {
    key: 'updateConfigJSON',
    value: function updateConfigJSON(options, overwrite) {
      try {
        this.isProcessing = true;
        this.status = _constants.FLOGO_ENGINE_STATUS.UPDATING_CONFIG_JSON;

        var defaultEngineBinPath = _path2.default.join(this.enginePath, this.options.name, 'bin');
        var configJSONPath = _path2.default.join(defaultEngineBinPath, 'config.json');
        var configData = options;
        if (!overwrite) {
          configData = (0, _utils.readJSONFileSync)(configJSONPath);
          configData = _lodash2.default.merge({}, configData, options);
        }
        (0, _utils.writeJSONFileSync)(configJSONPath, configData);
        console.log("[success][engine->updateConfigJSON]");

        this.isProcessing = false;
        return true;
      } catch (err) {
        console.error("[error][engine->updateConfigJSON] error: ", err);

        this.isProcessing = false;
        return false;
      }
    }

    /**
     * update the triggers.json file in the engine/bin folder.
     * @param {object} options - the json object for triggers.json. Default it will merge with triggers.json then write to triggers.json.
     * @param {Array} options.triggers - the configuration of triggers
     * @param {boolean} [overwrite=false] - whether use options to overwrite whole triggers.json. This means options == triggers.json
     */

  }, {
    key: 'updateTriggerJSON',
    value: function updateTriggerJSON(options, overwrite) {
      try {
        this.isProcessing = true;
        this.status = _constants.FLOGO_ENGINE_STATUS.UPDATING_TRIGGER_JSON;

        var defaultEngineBinPath = _path2.default.join(this.enginePath, this.options.name, 'bin');
        var triggersJSONPath = _path2.default.join(defaultEngineBinPath, 'triggers.json');
        console.log("[debug][engine->updateTriggerJSON], options: ", options);
        var triggersData = options;
        if (!overwrite) {
          (function () {
            var nTriggersData = {
              "triggers": []
            };
            triggersData = (0, _utils.readJSONFileSync)(triggersJSONPath);
            // console.log("[debug][engine->updateTriggerJSON], triggersData: ", triggersData);
            // get the triggers config in triggers.json
            var triggers = triggersData && triggersData.triggers || [];
            var nTriggers = options && options.triggers || [];

            triggers.forEach(function (trigger) {
              // find the config for this trigger
              var nTrigger = _lodash2.default.find(nTriggers, { "name": trigger && trigger.name }) || {};
              nTriggersData.triggers.push(_lodash2.default.merge({}, trigger, nTrigger));
            });

            triggersData = nTriggersData;
          })();
        }
        (0, _utils.writeJSONFileSync)(triggersJSONPath, triggersData);

        this.isProcessing = false;
        console.log("[success][engine->updateTriggerJSON]", triggersData);
      } catch (err) {
        console.error("[error][engine->updateTriggerJSON] error: ", err);

        this.isProcessing = false;
        return false;
      }
    }

    /**
     * Asynchronously build the engine.
     *
     * For valid compile os and architechture values see https://golang.org/doc/install/source#environment
     *
     * @param opts Options for engine build
     * @param opts.optimize {boolean} Optimize for embedded flows. Default false.
     * @param opts.incorporateConfig {boolean} incorporate config into application. Default false.
     * @param opts.compile.os {string} Target operating system. Default value false. Falsy value will fallback to engine host's default os.
     * @param opts.compile.arch {string} Target compilation architechture. Default value false. Falsy value will fallback to engine host's default arch.
     *
     * @returns {Promise<boolean>} whether build was successful or not
     */

  }, {
    key: 'build',
    value: function build(opts) {
      var _this3 = this;

      var self = this;

      var defaultOpts = {
        optimize: false, incorporateConfig: false,
        compile: { os: false, arch: false }
      };
      opts = Object.assign({}, defaultOpts, opts);

      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          self.isProcessing = false;
          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          console.error("[error] Engine->build. Error: ", err);

          self.isProcessing = false;
          reject(false);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.BUILDING;

        var defaultEnginePath = _path2.default.join(_this3.enginePath, _this3.options.name);

        var args = [opts.optimize ? '-o' : '', opts.incorporateConfig ? '-i' : ''].join(' ').trim();

        var env = {};

        if (opts.compile) {
          if (opts.compile.os) {
            env['GOOS'] = opts.compile.os;
          }

          if (opts.compile.arch) {
            env['GOARCH'] = opts.compile.arch;
          }
        }

        console.log('[log] Build flogo: "flogo build ' + args + '" compileOpts:');
        (0, _utils.inspectObj)(env);

        (0, _utils.runShellCMD)('flogo', ['build'].concat(args.split(' ')), {
          cwd: defaultEnginePath,
          env: Object.assign({}, process.env, env)
        }).then(successHandler).catch(errorHandler);
      });
    }

    /**
     * Start engine in the background
     * @return {Promise<boolean>} if start successful, return true, otherwise return false
     */

  }, {
    key: 'start',
    value: function start() {
      var self = this;
      console.log('[info] starting engine ' + self.options.name);

      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          self.isStarted = true;
          self.status = _constants.FLOGO_ENGINE_STATUS.STARTED;
          self.isProcessing = false;
          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          console.error("[error] Engine->start. Error: ", err);

          self.isProcessing = false;
          reject(false);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.STARTING;

        var defaultEngineBinPath = _path2.default.join(self.enginePath, self.options.name, 'bin');
        console.log("[info] defaultEngineBinPath: ", defaultEngineBinPath);
        var command = "./" + self.options.name; //+ " &";
        console.log("[info] command: ", command);

        var logFile = _path2.default.join(_appConfig.config.publicPath, self.options.name + '.log');
        var logStream = fs.createWriteStream(logFile, { flags: 'a' });
        console.log("[info] engine logFile: ", logFile);

        if (!(0, _utils.isExisted)(_path2.default.join(defaultEngineBinPath, command))) {

          console.log('[error] engine ' + self.options.name + ' doesn\'t exist');
          errorHandler(new Error('[error] engine ' + self.options.name + ' doesn\'t exist'));
        } else {

          var engineProcess = spawn(command, {
            cwd: defaultEngineBinPath
          });

          // log engine output
          engineProcess.stdout.pipe(logStream);
          engineProcess.stderr.pipe(logStream);

          successHandler();
        }
      });
    }

    /**
     * Stop engine
     * @return {Promise<boolean>} if stop successful, return true, otherwise return false
     */

  }, {
    key: 'stop',
    value: function stop() {
      var self = this;

      return new Promise(function (resolve, reject) {

        var successHandler = function successHandler() {
          self.isStarted = false;
          self.status = _constants.FLOGO_ENGINE_STATUS.STOPPED;
          self.isProcessing = false;

          resolve(true);
        };

        var errorHandler = function errorHandler(err) {
          console.error("[error] Engine->stop. Error: ", err);

          self.isProcessing = false;
          reject(false);
        };

        self.isProcessing = true;
        self.status = _constants.FLOGO_ENGINE_STATUS.STOPPING;

        // try to get the process id
        // if cannot get the process id, considering as the engine is stopped.
        // otherwise, try to stop the engine.
        try {
          execSync('pgrep ' + self.options.name);

          try {
            execSync('pgrep ' + self.options.name + ' | xargs kill -9');
            successHandler();
          } catch (err) {
            errorHandler(err);
          }
        } catch (err) {
          successHandler();
        }
      });
    }
  }, {
    key: 'loadInfoFromExisting',
    value: function loadInfoFromExisting() {
      var _this4 = this;

      return (0, _commands.list)(_path2.default.join(this.enginePath, this.options.name)).then(function (data) {
        _this4.installedActivites = mapTasks(data.activities);
        _this4.installedTriggers = mapTasks(data.triggers);

        console.log('<Installed activities>');
        console.log(_this4.installedActivites);
        console.log('<Installed triggers>');
        console.log(_this4.installedTriggers);
      });

      function mapTasks(tasks) {
        return _lodash2.default.fromPairs(tasks.map(function (task) {
          return [task.name, { path: task.path, version: tasks.version }];
        }));
      }
    }
  }, {
    key: 'isProcessing',
    get: function get() {
      this._isProcessing = this._isProcessing || [];
      // if nothing is running, return false,
      return !!this._isProcessing.length;
    },
    set: function set(status) {
      this._isProcessing = this._isProcessing || [];

      // keep record the number of true
      // a false will remove a true;
      if (status === true) {
        this._isProcessing.push(status);
      } else if (status === false) {
        this._isProcessing.pop();
      }
    }
  }, {
    key: 'status',
    get: function get() {
      this._status = this._status || [];

      return this._status[this._status.length < 1 ? 0 : this._status.length - 1];
    },
    set: function set(status) {
      this._status = this._status || [];

      // clear the previous finished status;
      var statusStackLen = this._isProcessing.length;
      var diffLen = this._status.length - statusStackLen;

      if (diffLen < 0) {
        diffLen = 0;
      }

      for (var i = 0; i < diffLen; i++) {
        this._status.shift();
      }

      // add new status;
      this._status.push(status);
    }
  }]);

  return Engine;
}();

/**
 * singleton engines
 */

var testEngine = null;
var buildEngine = null;

function getTestEngine() {
  return new Promise(function (resolve, reject) {

    if (testEngine) {
      resolve(testEngine);
    }

    console.log('[log] creating new test engine...');

    testEngine = new Engine({
      name: _appConfig.config.testEngine.name,
      path: _appConfig.config.testEngine.path,
      port: _appConfig.config.testEngine.port
    });

    testEngine.init().then(function () {
      resolve(testEngine);
    }).catch(reject);
  });
}

function initTestEngine() {

  // get a test engine
  // add default activities and triggers
  // update configurations
  // return the initalised test engine.
  var initEnginePromise = getTestEngine();

  if (!NO_ENGINE_RECREATION) {
    initEnginePromise = initEnginePromise.then(function (testEngine) {
      // using testEngine to shadow the local testEngine.
      console.log('[log] adding activities to the test engine, will take some time...');
      return testEngine.addAllActivities();
    }).then(function () {
      console.log('[log] adding triggers to the test engine, will take some time...');
      return testEngine.addAllTriggers(_appConfig.config.testEngine.installConfig);
    });
  } else {
    /* WILL be loaded externally
    initEnginePromise = initEnginePromise.then(testEngine => {
      return testEngine.loadInfoFromExisting();
    })
     */
  }

  return initEnginePromise.then(function () {
    console.log('[log] updating configurations of the test engine, will take some time...');
    // update config.json, use overwrite mode
    testEngine.updateConfigJSON(_appConfig.config.testEngine.config, true);
    // update triggers.json
    testEngine.updateTriggerJSON({
      "triggers": _appConfig.config.testEngine.triggers
    });
  }).then(function () {
    _appConfig.engines.test = testEngine;
    return testEngine;
  });
}

function getInitialisedTestEngine() {
  if (testEngine) {
    return Promise.resolve(testEngine);
  } else {
    return initTestEngine();
  }
}

function getBuildEngine() {
  return new Promise(function (resolve, reject) {

    if (buildEngine) {
      resolve(buildEngine);
    }

    console.log('[log] creating new build engine...');

    buildEngine = new Engine({
      name: _appConfig.config.buildEngine.name,
      path: _appConfig.config.buildEngine.path,
      port: _appConfig.config.buildEngine.port
    });

    buildEngine.init().then(function () {
      resolve(buildEngine);
    }).catch(reject);
  });
}

function initBuildEngine() {

  // get a test engine
  // add default activities and triggers
  // return the initalised build engine.
  var initEnginePromise = getBuildEngine();

  if (!NO_ENGINE_RECREATION) {
    initEnginePromise = initEnginePromise.then(function (buildEngine) {
      // using testEngine to shadow the local buildEngine.
      console.log('[log] adding activities to the build engine, will take some time...');
      return buildEngine.addAllActivities();
    }).then(function () {
      console.log('[log] adding triggers to the build engine, will take some time...');
      return buildEngine.addAllTriggers(_appConfig.config.buildEngine.installConfig);
    });
  } else {
    /* WILL be loaded externally
    initEnginePromise = initEnginePromise.then(buildEngine => {
      return buildEngine.loadInfoFromExisting();
    })*/
  }

  return initEnginePromise.then(function () {
    _appConfig.engines.build = buildEngine;
    return buildEngine;
  });
}

function getInitialisedBuildEngine() {
  if (buildEngine) {
    return Promise.resolve(buildEngine);
  } else {
    return initBuildEngine();
  }
}