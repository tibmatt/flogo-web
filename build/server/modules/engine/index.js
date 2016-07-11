'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Engine = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appConfig = require('../../config/app-config');

var _utils = require('../../common/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var execSync = require('child_process').execSync;
var fs = require('fs');

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
    this.engineStarted = false;

    this.removeEngine();
    this.createEngine();

    return this;
  }

  /**
   * Stop engine and remove it
   * @return {boolean} if remove successful, return true, otherwise return false
   */


  _createClass(Engine, [{
    key: 'removeEngine',
    value: function removeEngine() {
      try {
        var engineFolder = _path2.default.join(this.enginePath, this.options.name);
        // if engine is running stop it
        this.stop();
        // remove the engine folder
        if ((0, _utils.isExisted)(engineFolder)) {
          execSync('rm -rf ' + engineFolder);
        }
        return true;
      } catch (err) {
        console.error("[Error]Engine->removeEngine. Error: ", err);
        return false;
      }
    }

    /**
     * Create an engine
     * @return {boolean} if create successful, return true, otherwise return false
     */

  }, {
    key: 'createEngine',
    value: function createEngine() {
      try {
        execSync('flogo create ' + this.options.name, {
          cwd: this.enginePath
        });
        return true;
      } catch (err) {
        console.error("[Error]Engine->createEngine. Error: ", err);
        return false;
      }
    }

    /**
     * [addAllActivities description]
     * @param {[type]} options [description]
     */

  }, {
    key: 'addAllActivities',
    value: function addAllActivities(options) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _appConfig.activitiesDBService.allDocs().then(function (result) {
          //console.log("[info]addAllActivities, result", result);
          result ? result : result = [];
          options ? options : options = {};

          result.forEach(function (item) {
            item ? item : item = {};
            var ignore = options[item.name] && options[item.name].ignore || false;
            if (item.where) {
              if (!ignore) {
                _this.addActivity(item.name, item.where);
              } else {
                console.log("[info] ignore");
              }
            } else {
              console.error("[error]", item.name, " where isn't defined");
            }
          });

          resolve(true);
        }).catch(function (err) {
          console.error("[error]activitiesDBService.allDocs(), err: ", err);
          reject(err);
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
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _appConfig.triggersDBService.allDocs().then(function (result) {
          //console.log("[info]triggersDBService, result", result);
          result ? result : result = [];
          options ? options : options = {};

          result.forEach(function (item) {
            item ? item : item = {};
            var ignore = options[item.name] && options[item.name].ignore || false;
            if (item.where) {
              if (!ignore) {
                _this2.addTrigger(item.name, item.where);
              } else {
                console.log("[info] ignore");
              }
            } else {
              console.error("[error]", item.name, " where isn't defined");
            }
          });

          resolve(true);
        }).catch(function (err) {
          console.error("[error]triggersDBService.allDocs(), err: ", err);

          reject(err);
        });
      });
    }

    /**
     * Add an activity to the engine
     * @param {string} activityName - the name of this activity.
     * @param {string} activityPath - the path of this activity.
     * @return {boolean} if create successful, return true, otherwise return false
     */

  }, {
    key: 'addActivity',
    value: function addActivity(activityName, activityPath) {
      try {
        var defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo add activity ' + activityPath);
        execSync('flogo add activity ' + activityPath, {
          cwd: defaultEnginePath
        });

        this.installedActivites[activityName] = {
          path: activityPath
        };

        return true;
      } catch (err) {
        console.error("[Error]Engine->addActivity. Error: ", err);
        return false;
      }
    }

    /**
     * Add an trigger to the engine
     * @param {string} triggerName - the name of this trigger.
     * @param {string} triggerPath - the path of this trigger.
     * @return {boolean} if create successful, return true, otherwise return false
     */

  }, {
    key: 'addTrigger',
    value: function addTrigger(triggerName, triggerPath) {
      try {
        var defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo add trigger ' + triggerPath);
        execSync('flogo add trigger ' + triggerPath, {
          cwd: defaultEnginePath
        });

        this.installedTriggers[triggerName] = {
          path: triggerPath
        };

        return true;
      } catch (err) {
        console.error("[Error]Engine->addTrigger. Error: ", err);
        return false;
      }
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
        var defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo add model ' + modelPath);
        execSync('flogo add model ' + modelPath, {
          cwd: defaultEnginePath
        });

        this.installedModels[modelName] = {
          path: modelPath
        };

        return true;
      } catch (err) {
        console.error("[Error]Engine->addModel. Error: ", err);
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
        var defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo add flow ' + flowPath);
        if (!flowName) {
          var parseResult = _path2.default.parse(flowPath);
          flowName = parseResult.name;
        }
        console.log("[info][Engine->addFlow] flowName: ", flowName);

        execSync('flogo add flow ' + flowPath, {
          cwd: defaultEnginePath
        });
        this.installedFlows[flowName] = {
          path: flowPath
        };

        return flowName;
      } catch (err) {
        console.error("[Error]Engine->addFlow. Error: ", err);
        return false;
      }
    }

    /**
     * Delete an activity in this engine
     * @param {string} activityName - the name of activity
     * @return {boolean} if successful, return true, otherwise return false
     */

  }, {
    key: 'deleteActivity',
    value: function deleteActivity(activityName) {
      try {
        var defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo del activity ' + activityName);

        execSync('flogo del activity ' + activityName, {
          cwd: defaultEnginePath
        });

        delete this.installedActivites[activityName];
        return true;
      } catch (err) {
        console.error("[Error]Engine->deleteActivity. Error: ", err);
        return false;
      }
    }

    /**
     * Delete a trigger in this engine
     * @param {string} triggerName - the name of trigger
     * @return {boolean} if successful, return true, otherwise return false
     */

  }, {
    key: 'deleteTrigger',
    value: function deleteTrigger(triggerName) {
      try {
        var defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo del trigger ' + triggerName);

        execSync('flogo del trigger ' + triggerName, {
          cwd: defaultEnginePath
        });

        delete this.installedTriggers[triggerName];
        return true;
      } catch (err) {
        console.error("[Error]Engine->deleteTrigger. Error: ", err);
        return false;
      }
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
        var defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        console.log('[info]flogo del model ' + modelName);

        execSync('flogo del model ' + modelName, {
          cwd: defaultEnginePath
        });

        delete this.installedModels[modelName];
        return true;
      } catch (err) {
        console.error("[Error]Engine->deleteModel. Error: ", err);
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
        var defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        var flow = 'embedded://' + flowName;
        console.log('[info]flogo del flow ' + flow);

        execSync('flogo del flow ' + flow, {
          cwd: defaultEnginePath
        });

        delete this.installedFlows[flowName];
        return true;
      } catch (err) {
        console.error("[Error]Engine->deleteFlow. Error: ", err);
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
      var _this3 = this;

      try {
        var flowNames = _lodash2.default.keys(this.installedFlows);
        flowNames.forEach(function (flowName) {
          _this3.deleteFlow(flowName);
        });
        return true;
      } catch (err) {
        console.error("[Error]Engine->deleteAllFlows. Error: ", err);
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
        var defaultEngineBinPath = _path2.default.join(this.enginePath, this.options.name, 'bin');
        var configJSONPath = _path2.default.join(defaultEngineBinPath, 'config.json');
        var configData = options;
        if (!overwrite) {
          configData = (0, _utils.readJSONFileSync)(configJSONPath);
          configData = _lodash2.default.merge({}, configData, options);
        }
        (0, _utils.writeJSONFileSync)(configJSONPath, configData);
        console.log("[success][engine->updateConfigJSON]");
        return true;
      } catch (err) {
        console.error("[error][engine->updateConfigJSON] error: ", err);
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
        console.log("[success][engine->updateTriggerJSON]", triggersData);
      } catch (err) {
        console.error("[error][engine->updateTriggerJSON] error: ", err);
        return false;
      }
    }
  }, {
    key: 'build',
    value: function build(args) {
      try {
        var defaultEnginePath = _path2.default.join(this.enginePath, this.options.name);
        args ? args : args = '';
        execSync('flogo build ' + args, {
          cwd: defaultEnginePath
        });
        return true;
      } catch (err) {
        console.error("[Error]Engine->build. Error: ", err);
        return false;
      }
    }

    /**
     * Start engine in the background
     * @return {boolean} if start successful, return true, otherwise return false
     */

  }, {
    key: 'start',
    value: function start() {
      try {
        console.log("[info]start");
        var defaultEngineBinPath = _path2.default.join(this.enginePath, this.options.name, 'bin');
        console.log("[info]defaultEngineBinPath: ", defaultEngineBinPath);
        var command = "./" + this.options.name; //+ " &";
        console.log("[info]command: ", command);

        var logFile = _path2.default.join(_appConfig.config.publicPath, this.options.name + '.log');
        var logStream = fs.createWriteStream(logFile, { flags: 'a' });
        console.log("[info]engine logFile: ", logFile);

        if (!(0, _utils.isExisted)(_path2.default.join(defaultEngineBinPath, command))) {
          console.log("[error]engine doesn't exist");
          return false;
        }

        var engineProcess = spawn(command, {
          cwd: defaultEngineBinPath
        });

        // log engine output
        engineProcess.stdout.pipe(logStream);
        engineProcess.stderr.pipe(logStream);

        this.engineStarted = true;
        return true;
      } catch (err) {
        console.error("[Error]Engine->start. Error: ", err);
        return false;
      }
    }

    /**
     * Stop engine
     * @return {boolean} if stop successful, return true, otherwise return false
     */

  }, {
    key: 'stop',
    value: function stop() {
      try {
        var port = this.options.port;
        var name = this.options.name;
        execSync('pgrep ' + name + ' | xargs kill -9');
        this.engineStarted = false;

        return true;
      } catch (err) {
        console.error("[Error]Engine->stop. Error: ", err);
        return false;
      }
    }
  }]);

  return Engine;
}();