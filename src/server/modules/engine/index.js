import path from 'path';
import _ from 'lodash';

import {
  config,
  activitiesDBService,
  triggersDBService,
  engines
} from '../../config/app-config';
import {
  isExisted,
  readJSONFileSync,
  writeJSONFileSync
} from '../../common/utils';
import { FLOGO_ENGINE_STATUS } from '../../common/constants';

const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const execSync = require('child_process').execSync;
const fs = require('fs');

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
    // Installed flow
    this.installedFlows = {
    };

    // currently engine is started or not
    this.isStarted = false;

    // if the current engine is running internal tasks such as adding activity,
    // namely, the engine is down and unable to serve
    this.isProcessing = false;

    this.status = FLOGO_ENGINE_STATUS['give me an undefined'];

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
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.REMOVING;

      let engineFolder = path.join(this.enginePath, this.options.name);
      // if engine is running stop it
      this.stop();
      // remove the engine folder
      if (isExisted(engineFolder)) {
        execSync(`rm -rf ${engineFolder}`);
      }

      this.isProcessing = false;
      this.status = FLOGO_ENGINE_STATUS.REMOVED;
      return true;
    } catch (err) {
      console.error("[Error]Engine->removeEngine. Error: ", err);

      this.isProcessing = false;
      return false;
    }
  }

  /**
   * Create an engine
   * @return {boolean} if create successful, return true, otherwise return false
   */
  createEngine() {
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.CREATING;

      execSync(`flogo create ${this.options.name}`, {
        cwd: this.enginePath
      });

      this.isProcessing = false;
      this.status = FLOGO_ENGINE_STATUS.CREATED;
      return true;
    } catch (err) {
      console.error("[Error]Engine->createEngine. Error: ", err);

      this.isProcessing = false;
      return false;
    }
  }

  /**
   * [addAllActivities description]
   * @param {[type]} options [description]
   */
  addAllActivities(options) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.ADDING_ACTIVITY;

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

        self.isProcessing = false;
        resolve(true);
      }).catch((err) => {
        console.error("[error]activitiesDBService.allDocs(), err: ", err);

        self.isProcessing = false;
        reject(err);
      });
    });
  }

  /**
   * [addAllTriggers description]
   * @param {[type]} options [description]
   */
  addAllTriggers(options) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.ADDING_TRIGGER;

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

        self.isProcessing = false;
        resolve(true);
      }).catch((err) => {
        console.error("[error]triggersDBService.allDocs(), err: ", err);

        self.isProcessing = false;
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
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.ADDING_ACTIVITY;

      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo add activity ${activityPath}`);
      execSync(`flogo add activity ${activityPath}`, {
        cwd: defaultEnginePath
      });

      this.installedActivites[activityName] = {
        path: activityPath
      };

      this.isProcessing = false;
      return true;
    } catch (err) {
      console.error("[Error]Engine->addActivity. Error: ", err);

      this.isProcessing = false;
      return false;
    }
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
  hasActivity( activityName, activityPath ) {
    const activity = this.installedActivites[ activityName ];
    const exists = !_.isNil( activity );

    return {
      exists : exists,
      samePath : exists && activity.path === activityPath
    };
  }

  /**
   * Add an trigger to the engine
   * @param {string} triggerName - the name of this trigger.
   * @param {string} triggerPath - the path of this trigger.
   * @return {boolean} if create successful, return true, otherwise return false
   */
  addTrigger(triggerName, triggerPath) {
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.ADDING_TRIGGER;

      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo add trigger ${triggerPath}`);
      execSync(`flogo add trigger ${triggerPath}`, {
        cwd: defaultEnginePath
      });

      this.installedTriggers[triggerName] = {
        path: triggerPath
      };

      this.isProcessing = false;
      return true;
    } catch (err) {
      console.error("[Error]Engine->addTrigger. Error: ", err);

      this.isProcessing = false;
      return false;
    }
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
  hasTrigger( triggerName, triggerPath ) {
    const trigger = this.installedTriggers[ triggerName ];
    const exists = !_.isNil( trigger );

    return {
      exists : exists,
      samePath : exists && trigger.path === triggerPath
    };
  }

  /**
   * Add an model to the engine
   * @param {string} modelName - the name of this model.
   * @param {string} modelPath - the path of this model.
   * @return {boolean} if create successful, return true, otherwise return false
   */
  addModel(modelName, modelPath) {
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.ADDING_MODEL;

      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo add model ${modelPath}`);
      execSync(`flogo add model ${modelPath}`, {
        cwd: defaultEnginePath
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
  addFlow(flowPath, flowName){
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.ADDING_FLOW;

      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo add flow ${flowPath}`);
      if(!flowName){
        let parseResult = path.parse(flowPath);
        flowName = parseResult.name;
      }
      console.log("[info][Engine->addFlow] flowName: ", flowName);

      execSync(`flogo add flow ${flowPath}`, {
        cwd: defaultEnginePath
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
   * @return {boolean} if successful, return true, otherwise return false
   */
  deleteActivity(activityName){
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.REMOVING_ACTIVITY;

      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo del activity ${activityName}`);

      execSync(`flogo del activity ${activityName}`, {
        cwd: defaultEnginePath
      });

      delete this.installedActivites[activityName];

      this.isProcessing = false;
      return true;
    } catch (err) {
      console.error("[Error]Engine->deleteActivity. Error: ", err);

      this.isProcessing = false;
      return false;
    }
  }

  /**
   * Delete a trigger in this engine
   * @param {string} triggerName - the name of trigger
   * @return {boolean} if successful, return true, otherwise return false
   */
  deleteTrigger(triggerName){
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.REMOVING_TRIGGER;

      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo del trigger ${triggerName}`);

      execSync(`flogo del trigger ${triggerName}`, {
        cwd: defaultEnginePath
      });

      delete this.installedTriggers[triggerName];

      this.isProcessing = false;
      return true;
    } catch (err) {
      console.error("[Error]Engine->deleteTrigger. Error: ", err);

      this.isProcessing = false;
      return false;
    }
  }

  /**
   * Delete a model in this engine
   * @param {string} modelName - the name of model
   * @return {boolean} if successful, return true, otherwise return false
   */
  deleteModel(modelName){
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.REMOVING_MODEL;

      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      console.log(`[info]flogo del model ${modelName}`);

      execSync(`flogo del model ${modelName}`, {
        cwd: defaultEnginePath
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
  deleteFlow(flowName){
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.REMOVING_FLOW;

      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      let flow = `embedded://${flowName}`
      console.log(`[info]flogo del flow ${flow}`);

      execSync(`flogo del flow ${flow}`, {
        cwd: defaultEnginePath
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
  deleteAllFlows(){
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.REMOVING_FLOW;

      let flowNames = _.keys(this.installedFlows);
      flowNames.forEach((flowName)=>{
        this.deleteFlow(flowName);
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
  updateConfigJSON(options, overwrite) {
    try{
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.UPDATING_CONFIG_JSON;

      let defaultEngineBinPath = path.join(this.enginePath, this.options.name, 'bin');
      let configJSONPath = path.join(defaultEngineBinPath, 'config.json');
      let configData = options;
      if (!overwrite) {
        configData = readJSONFileSync(configJSONPath);
        configData = _.merge({}, configData, options);
      }
      writeJSONFileSync(configJSONPath, configData);
      console.log("[success][engine->updateConfigJSON]");

      this.isProcessing = false;
      return true;
    }catch(err){
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
  updateTriggerJSON(options, overwrite) {
    try{
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.UPDATING_TRIGGER_JSON;

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

      this.isProcessing = false;
      console.log("[success][engine->updateTriggerJSON]", triggersData);
    }catch(err){
      console.error("[error][engine->updateTriggerJSON] error: ", err);

      this.isProcessing = false;
      return false;
    }
  }

  build(args) {
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.BUILDING;

      let defaultEnginePath = path.join(this.enginePath, this.options.name);
      args ? args: (args='');
      execSync(`flogo build ${args}`, {
        cwd: defaultEnginePath
      });

      this.isProcessing = false;
      return true;
    } catch (err) {
      console.error("[Error]Engine->build. Error: ", err);

      this.isProcessing = false;
      return false;
    }
  }

  /**
   * Start engine in the background
   * @return {boolean} if start successful, return true, otherwise return false
   */
  start() {
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.STARTING;

      console.log("[info]start");
      let defaultEngineBinPath = path.join(this.enginePath, this.options.name, 'bin');
      console.log("[info]defaultEngineBinPath: ", defaultEngineBinPath);
      let command = "./" + this.options.name; //+ " &";
      console.log("[info]command: ", command);

      let logFile = path.join(config.publicPath, this.options.name+'.log')
      let logStream = fs.createWriteStream(logFile, { flags: 'a' });
      console.log("[info]engine logFile: ", logFile);

      if(!isExisted(path.join(defaultEngineBinPath, command))){
        console.log("[error]engine doesn't exist");
        return false;
      }

      let engineProcess = spawn(command, {
        cwd: defaultEngineBinPath
      });

      // log engine output
      engineProcess.stdout.pipe(logStream);
      engineProcess.stderr.pipe(logStream);

      this.isStarted = true;
      this.status = FLOGO_ENGINE_STATUS.STARTED;
      this.isProcessing = false;
      return true;
    } catch (err) {
      console.error("[Error]Engine->start. Error: ", err);

      this.isProcessing = false;
      return false;
    }
  }

  /**
   * Stop engine
   * @return {boolean} if stop successful, return true, otherwise return false
   */
  stop(){
    try {
      this.isProcessing = true;
      this.status = FLOGO_ENGINE_STATUS.STOPPING;

      let port = this.options.port;
      let name = this.options.name;
      execSync(`pgrep ${name} | xargs kill -9`);
      this.isStarted = false;

      this.status = FLOGO_ENGINE_STATUS.STARTED;
      this.isProcessing = false;
      return true;
    }catch(err){
      console.error("[Error]Engine->stop. Error: ", err);

      this.isProcessing = false;
      return false;
    }
  }
}

/**
 * singleton engines
 */

let testEngine = null;
let buildEngine = null;

export function getTestEngine() {
  return new Promise( ( resolve, reject )=> {

    if ( testEngine ) {
      resolve( testEngine );
    }

    console.log( `[log] creating new test engine...` );

    testEngine = new Engine( {
      name : config.testEngine.name,
      path : config.testEngine.path,
      port : config.testEngine.port
    } );

    resolve( testEngine );
  } );
}

export function initTestEngine() {

  // get a test engine
  // add default activities and triggers
  // update configurations
  // return the initalised test engine.
  return getTestEngine()
    .then( ( testEngine )=> { // using testEngine to shadow the local testEngine.
      console.log( `[log] adding activities to the test engine, will take some time...` );
      return testEngine.addAllActivities();
    } )
    .then( ()=> {
      console.log( `[log] adding triggers to the test engine, will take some time...` );
      return testEngine.addAllTriggers( config.testEngine.installConfig );
    } )
    .then( ()=> {
      console.log( `[log] updating configurations of the test engine, will take some time...` );
      // update config.json, use overwrite mode
      testEngine.updateConfigJSON( config.testEngine.config, true );
      // update triggers.json
      testEngine.updateTriggerJSON( {
        "triggers" : config.testEngine.triggers
      } );

      engines.test = testEngine;
      return testEngine;
    } );
}

export function getInitialisedTestEngine() {
  if (testEngine) {
    return Promise.resolve(testEngine);
  } else {
    return initTestEngine();
  }
}

export function getBuildEngine() {
  return new Promise( ( resolve, reject )=> {

    if ( buildEngine ) {
      resolve( buildEngine );
    }

    console.log( `[log] creating new build engine...` );

    buildEngine = new Engine( {
      name : config.buildEngine.name,
      path : config.buildEngine.path,
      port : config.buildEngine.port
    } );

    resolve( buildEngine );
  } );
}

export function initBuildEngine() {

  // get a test engine
  // add default activities and triggers
  // return the initalised build engine.
  return getBuildEngine()
    .then( ( buildEngine )=> { // using testEngine to shadow the local buildEngine.
      console.log( `[log] adding activities to the build engine, will take some time...` );
      return buildEngine.addAllActivities()
    } )
    .then( ()=> {
      console.log( `[log] adding triggers to the build engine, will take some time...` );
      return buildEngine.addAllTriggers( config.buildEngine.installConfig );
    } )
    .then( ()=> {
      engines.build = buildEngine;
      return buildEngine;
    } );
}

export function getInitialisedBuildEngine() {
  if ( buildEngine ) {
    return Promise.resolve( buildEngine );
  } else {
    return initBuildEngine();
  }
}
