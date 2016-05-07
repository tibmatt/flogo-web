import path from 'path';
import _ from 'lodash';

import {
  config,
  activitiesDBService,
  triggersDBService
} from '../../config/app-config';
import {
  isExisted,
  readJSONFileSync,
  writeJSONFileSync
} from '../../common/utils';

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

//TODO: make sync function to async

export class Engine {
  /**
   * constructor function of Engine
   * @param {object} options - the configuration of engine
   * @param {string} options.name - the name of this engine
   * @param {string} options.path - the root path to this engine
   * @param {number} options.port - the port of this engine
   * @return {Engine} - return Engine instance
   */
  constructor(options) {
    this.options = _.cloneDeep(options);
    // The path to this engine.
    this.enginePath = path.join(config.rootPath, this.options.path);
    // Installed activities
    this.installedActivites = {
    };
    // Installed triggers
    this.installedTriggers = {
    };
    // Installed models
    // TODO for now, model is installed by engine default, so this object is empty
    this.installedModels = {
    };

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
  removeEngine() {
    try {
      let engineFolder = path.join(this.enginePath, this.options.name);
      // if engine is running stop it
      this.stop();
      // remove the engine folder
      if (isExisted(engineFolder)) {
        execSync(`rm -rf ${engineFolder}`);
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
  createEngine() {
    try {
      execSync(`flogo create ${this.options.name}`, {
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
  addAllActivities(options) {
    return new Promise((resolve, reject) => {
      activitiesDBService.allDocs().then((result) => {
        //console.log("[info]addAllActivities, result", result);
        result ? result : (result = []);
        options ? options : (options = {});

        result.forEach((item) => {
          item ? item : (item = {});
          let ignore = options[item.name] && options[item.name].ignore || false;
          if (item.where) {
            if (!ignore) {
              this.addActivity(item.name, item.where);
            } else {
              console.log("[info] ignore");
            }
          } else {
            console.error("[error]", item.name, " where isn't defined");
          }
        });

        resolve(true);
      }).catch((err) => {
        console.error("[error]activitiesDBService.allDocs(), err: ", err);
        reject(err);
      });
    });
  }

  /**
   * [addAllTriggers description]
   * @param {[type]} options [description]
   */
  addAllTriggers(options) {
    return new Promise((resolve, reject) => {
      triggersDBService.allDocs().then((result) => {
        //console.log("[info]triggersDBService, result", result);
        result ? result : (result = []);
        options ? options : (options = {});

        result.forEach((item) => {
          item ? item : (item = {});
          let ignore = options[item.name] && options[item.name].ignore || false;
          if (item.where) {
            if (!ignore) {
              this.addTrigger(item.name, item.where);
            } else {
              console.log("[info] ignore");
            }
          } else {
            console.error("[error]", item.name, " where isn't defined");
          }
        });

        resolve(true);
      }).catch((err) => {
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
  addActivity(activityName, activityPath) {
    try {
      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo add activity ${activityPath}`);
      execSync(`flogo add activity ${activityPath}`, {
        cwd: defaultEnginePath
      });

      this.installedActivites[activityName] = {
        path: activityPath
      }

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
  addTrigger(triggerName, triggerPath) {
    try {
      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo add trigger ${triggerPath}`);
      execSync(`flogo add trigger ${triggerPath}`, {
        cwd: defaultEnginePath
      });

      this.installedTriggers[triggerName] = {
        path: triggerPath
      }

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
  addModel(modelName, modelPath) {
    try {
      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo add model ${modelPath}`);
      execSync(`flogo add model ${modelPath}`, {
        cwd: defaultEnginePath
      });

      this.installedModels[modelName] = {
        path: modelPath
      }

      return true;
    } catch (err) {
      console.error("[Error]Engine->addModel. Error: ", err);
      return false;
    }
  }

  addFlow(){

  }

  deleteActivity(activityName){

  }

  deleteTrigger(triggerName){

  }

  deleteModel(modelName){

  }

  deleteFlow(){

  }

  /**
   * update the config.json file in the engine/bin folder
   * @param {object} options - the json object for config.json. Default it will merge with config.json then write to config.json
   * @param {boolean} [overwrite=false] - whether use options to overwrite whole config.json. This means options == config.json
   * @return {boolean} success: true, fail: false
   */
  updateConfigJSON(options, overwrite) {
    try{
      let defaultEngineBinPath = path.join(this.enginePath, this.options.name, 'bin');
      let configJSONPath = path.join(defaultEngineBinPath, 'config.json');
      let configData = options;
      if (!overwrite) {
        configData = readJSONFileSync(configJSONPath);
        configData = _.merge({}, configData, options);
      }
      writeJSONFileSync(configJSONPath, configData);
      console.log("[success][engine->updateConfigJSON]");
      return true;
    }catch(err){
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
  updateTriggerJSON(options, overwrite) {
    try{
      let defaultEngineBinPath = path.join(this.enginePath, this.options.name, 'bin');
      let triggersJSONPath = path.join(defaultEngineBinPath, 'triggers.json');
      console.log("[debug][engine->updateTriggerJSON], options: ", options);
      let triggersData = options;
      if (!overwrite) {
        let nTriggersData = {
          "triggers": []
        };
        triggersData = readJSONFileSync(triggersJSONPath);
        // console.log("[debug][engine->updateTriggerJSON], triggersData: ", triggersData);
        // get the triggers config in triggers.json
        let triggers = triggersData&&triggersData.triggers || [];
        let nTriggers = options&&options.triggers || [];

        triggers.forEach((trigger)=>{
          // find the config for this trigger
          let nTrigger = _.find(nTriggers, {"name": trigger&&trigger.name}) || {};
          nTriggersData.triggers.push(_.merge({}, trigger, nTrigger));
        });

        triggersData = nTriggersData;
      }
      writeJSONFileSync(triggersJSONPath, triggersData);
      console.log("[success][engine->updateTriggerJSON]", triggersData);
    }catch(err){
      console.error("[error][engine->updateTriggerJSON] error: ", err);
      return false;
    }
  }

  build() {
    try {
      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      execSync(`flogo build -i`, {
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
  start() {
    try {
      console.log("[info]start");
      let defaultEngineBinPath = path.join(this.enginePath, this.options.name, 'bin');
      console.log("[info]defaultEngineBinPath: ", defaultEngineBinPath);
      let command = "./" + this.options.name + " &";
      console.log("[info]command: ", command);
      exec(command, {
        cwd: defaultEngineBinPath
      });

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
  stop(){
    try {
      let port = this.options.port;
      execSync(`lsof -i:${port} | grep node | awk '{print $2}' | xargs kill -9`);
      this.engineStarted = false;

      return true;
    }catch(err){
      console.error("[Error]Engine->stop. Error: ", err);
      return false;
    }
  }
}
