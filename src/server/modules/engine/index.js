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
  writeJSONFileSync,
  runShellCMD,
  readJSONFile,
  writeJSONFile,
  inspectObj
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

    return this;
  }

  init() {
    return this.removeEngine()
      .then( () => {
        return this.createEngine();
      } )
      .then( ()=> {
        return this;
      } );
  }

  get isProcessing() {
    this._isProcessing = this._isProcessing || [];
    // if nothing is running, return false,
    return !!this._isProcessing.length;
  }

  set isProcessing( status ) {
    this._isProcessing = this._isProcessing || [];

    // keep record the number of true
    // a false will remove a true;
    if ( status === true ) {
      this._isProcessing.push( status );
    } else if ( status === false ) {
      this._isProcessing.pop();
    }
  }

  get status() {
    this._status = this._status || [];

    return this._status[ this._status.length < 1 ? 0 : this._status.length - 1 ];
  }

  set status( status ) {
    this._status = this._status || [];

    // clear the previous finished status;
    const statusStackLen = this._isProcessing.length;
    let diffLen = this._status.length - statusStackLen;

    if ( diffLen < 0 ) {
      diffLen = 0;
    }

    for ( let i = 0; i < diffLen; i++ ) {
      this._status.shift();
    }

    // add new status;
    this._status.push( status );
  }

  /**
   * Stop engine and remove it
   * @return {Promise<boolean>} if remove successful, return true, otherwise return false
   */
  removeEngine() {
    const self = this;
    return new Promise( ( resolve, reject ) => {

      const successHandler = ()=> {
        self.isProcessing = false;
        self.status = FLOGO_ENGINE_STATUS.REMOVED;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        console.error( "[error] Engine->removeEngine. Error: ", err );

        self.isProcessing = false;
        reject( false );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.REMOVING;
      const engineFolder = path.join( self.enginePath, self.options.name );

      // if engine is running stop it
      self.stop()
        .then( ()=> {
          // remove the engine folder
          if ( isExisted( engineFolder ) ) {
            return runShellCMD( 'rm', [ '-rf', engineFolder ] )
          }
        } )
        .then( successHandler )
        .catch( errorHandler );
    } );
  }

  /**
   * Create an engine
   * @return {Promise<boolean>} if create successful, return true, otherwise return false
   */
  createEngine() {
    const self = this;

    return new Promise( ( resolve, reject )=> {

      const successHandler = ()=> {
        self.isProcessing = false;
        self.status = FLOGO_ENGINE_STATUS.CREATED;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        console.error( "[error] Engine->createEngine. Error: ", err );

        self.isProcessing = false;
        reject( false );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.CREATING;

      runShellCMD( 'flogo', [ 'create', self.options.name ], {
        cwd : self.enginePath
      } )
        .then( successHandler )
        .catch( errorHandler );
    } );

  }

  /**
   * [addAllActivities description]
   * @param {[type]} options [description]
   */
  addAllActivities( options ) {
    let self = this;
    return new Promise( ( resolve, reject ) => {

      const successHandler = ()=> {
        self.isProcessing = false;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        self.isProcessing = false;
        reject( err );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.ADDING_ACTIVITY;

      activitiesDBService.allDocs()
        .then( ( activities ) => {

          options = options || [];
          activities = activities || [];

          return new Promise( ( resolve, reject )=> {

            let processedItemNum = 0;
            let runResult = [];

            function _sequentiallyRun() {

              let activity = activities[ processedItemNum ];

              processedItemNum++;

              let promise = null;

              activity = activity || {};

              let ignore = options[ activity.name ] && options[ activity.name ].ignore || false;

              if ( activity.where ) {
                if ( !ignore ) {
                  promise = self.addActivity( activity.name, activity.where );
                } else {
                  console.log( "[info] ignore" );
                  promise = Promise.resolve( true );
                }
              } else {
                console.error( "[error]", activity.name, " where isn't defined" );
                promise = Promise.resolve( false );
              }

              return promise.then( ( result )=> {
                if ( result !== false && !_.isNil( result ) ) {
                  runResult.push( true );
                } else {
                  runResult.push( false );
                }

                if ( processedItemNum >= activities.length ) {
                  console.log( `[log] add all activities result:` );
                  console.log( runResult );
                  resolve( true );
                } else {
                  return _sequentiallyRun();
                }
              } );
            }

            _sequentiallyRun()
              .catch( ( err )=> {
                console.log( `[error] add all activities -> sequentiallyRun on error: ` );
                console.error( err );
                reject( err );
              } );
          } ).then( successHandler );
        } )
        .catch( ( err ) => {
          console.error( "[error] activitiesDBService.allDocs(), err: ", err );
          errorHandler( err );
        } );
    } );
  }

  /**
   * [addAllTriggers description]
   * @param {[type]} options [description]
   */
  addAllTriggers(options) {
    let self = this;
    return new Promise((resolve, reject) => {
      const successHandler = ()=> {
        self.isProcessing = false;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        self.isProcessing = false;
        reject( err );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.ADDING_TRIGGER;

      triggersDBService.allDocs()
        .then( ( triggers ) => {

          options = options || [];
          triggers = triggers || [];

          return new Promise( ( resolve, reject )=> {

            let processedItemNum = 0;
            let runResult = [];

            function _sequentiallyRun() {

              let trigger = triggers[ processedItemNum ];

              processedItemNum++;

              let promise = null;

              trigger = trigger || {};

              let ignore = options[ trigger.name ] && options[ trigger.name ].ignore || false;

              if ( trigger.where ) {
                if ( !ignore ) {
                  promise = self.addTrigger( trigger.name, trigger.where );
                } else {
                  console.log( "[info] ignore" );
                  promise = Promise.resolve( true );
                }
              } else {
                console.error( "[error]", trigger.name, " where isn't defined" );
                promise = Promise.resolve( false );
              }

              return promise.then( ( result )=> {
                if ( result !== false && !_.isNil( result ) ) {
                  runResult.push( true );
                } else {
                  runResult.push( false );
                }

                if ( processedItemNum >= triggers.length ) {
                  console.log( `[log] add all triggers result:` );
                  console.log( runResult );
                  resolve( true );
                } else {
                  return _sequentiallyRun();
                }
              } );
            }

            _sequentiallyRun()
              .catch( ( err )=> {
                console.log( `[error] add all triggers -> sequentiallyRun on error: ` );
                console.error( err );
                reject( err );
              } );
          } ).then( successHandler );
        } )
        .catch( ( err ) => {
          console.error( "[error] triggersDBService.allDocs(), err: ", err );
          errorHandler( err );
        } );
    } );
  }

  /**
   * Add an activity to the engine
   * @param {string} activityName - the name of this activity.
   * @param {string} activityPath - the path of this activity.
   * @return {Promise<boolean>} if create successful, return true, otherwise return false
   */
  addActivity( activityName, activityPath ) {
    const self = this;

    return new Promise( ( resolve, reject )=> {

      const successHandler = ()=> {
        self.installedActivites[ activityName ] = {
          path : activityPath
        };

        self.isProcessing = false;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        console.error( "[error] Engine->addActivity. Error: ", err );

        self.isProcessing = false;
        reject( false );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.ADDING_ACTIVITY;

      let defaultEnginePath = path.join( self.enginePath, self.options.name );

      runShellCMD( 'flogo', [ 'add', 'activity', activityPath ], {
        cwd : defaultEnginePath
      } )
        .then( successHandler )
        .catch( errorHandler );
    } );
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
    const self = this;

    return new Promise( ( resolve, reject )=> {

      const successHandler = ()=> {
        self.installedTriggers[ triggerName ] = {
          path : triggerPath
        };

        self.isProcessing = false;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        console.error( "[error] Engine->addTrigger. Error: ", err );

        self.isProcessing = false;
        reject( false );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.ADDING_TRIGGER;

      let defaultEnginePath = path.join( self.enginePath, self.options.name );

      runShellCMD( 'flogo', [ 'add', 'trigger', triggerPath ], {
        cwd : defaultEnginePath
      } )
        .then( successHandler )
        .catch( errorHandler );
    } );
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

      // TODO sync to async
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

      // TODO sync to async
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
   * @return {Promise<boolean>} if successful, return true, otherwise return false
   */
  deleteActivity( activityName ) {
    const self = this;

    return new Promise( ( resolve, reject )=> {

      const successHandler = ()=> {
        delete self.installedActivites[ activityName ];

        self.isProcessing = false;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        console.error( "[error] Engine->deleteActivity. Error: ", err );

        self.isProcessing = false;
        reject( false );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.REMOVING_ACTIVITY;

      let defaultEnginePath = path.join( self.enginePath, self.options.name );

      runShellCMD( 'flogo', [ 'del', 'activity', activityName ], {
        cwd : defaultEnginePath
      } )
        .then( successHandler )
        .catch( errorHandler );
    } );
  }

  /**
   * Delete a trigger in this engine
   * Also update the trigger.json to remove the entry of this trigger.
   * @param {string} triggerName - the name of trigger
   * @return {boolean} if successful, return true, otherwise return false
   */
  deleteTrigger(triggerName){
    const self = this;

    return new Promise( ( resolve, reject )=> {

      const successHandler = ()=> {
        delete self.installedTriggers[triggerName];

        self.isProcessing = false;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        console.error( "[error] Engine->deleteTrigger. Error: ", err );

        self.isProcessing = false;
        reject( false );
      };

      // update the trigger.json to remove the entry of this trigger,
      // since the `flogo del` won't do that.
      const removeTriggerInfoFromTriggersJSON = () => {
        let triggersJSONPath = path.join( defaultEnginePath, 'bin', 'triggers.json' );

        return readJSONFile( triggersJSONPath )
          .then( ( triggersData )=> {
            console.log( '[TODO] engine -> deleteTrigger | original triggersData:' );
            inspectObj( triggersData );

            _.remove( triggersData.triggers, ( trigger ) => {
              return trigger.name === triggerName;
            } );

            console.log( '[TODO] engine -> deleteTrigger | modified triggersData:' );
            inspectObj( triggersData );

            return triggersData;
          } )
          .then( ( triggersData )=> {
            return writeJSONFile( triggersJSONPath, triggersData );
          } );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.REMOVING_TRIGGER;

      let defaultEnginePath = path.join( self.enginePath, self.options.name );

      runShellCMD( 'flogo', [ 'del', 'trigger', triggerName ], {
        cwd : defaultEnginePath
      } )
        .then( removeTriggerInfoFromTriggersJSON )
        .then( successHandler )
        .catch( errorHandler );
    } );
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

      // TODO sync to async
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

      // TODO sync to async
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

  build( args ) {
    const self = this;

    return new Promise( ( resolve, reject )=> {

      const successHandler = ()=> {
        self.isProcessing = false;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        console.error( "[error] Engine->build. Error: ", err );

        self.isProcessing = false;
        reject( false );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.BUILDING;

      const defaultEnginePath = path.join( this.enginePath, this.options.name );
      args = args || '';

      runShellCMD( 'flogo', [ 'build', args ], {
        cwd : defaultEnginePath
      } )
        .then( successHandler )
        .catch( errorHandler );
    } );
  }

  /**
   * Start engine in the background
   * @return {Promise<boolean>} if start successful, return true, otherwise return false
   */
  start() {
    const self = this;
    console.log( `[info] starting engine ${self.options.name}` );

    return new Promise( ( resolve, reject )=> {

      const successHandler = ()=> {
        self.isStarted = true;
        self.status = FLOGO_ENGINE_STATUS.STARTED;
        self.isProcessing = false;
        resolve( true );
      };

      const errorHandler = ( err ) => {
        console.error( "[error] Engine->start. Error: ", err );

        self.isProcessing = false;
        reject( false );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.STARTING;

      let defaultEngineBinPath = path.join( self.enginePath, self.options.name, 'bin' );
      console.log( "[info] defaultEngineBinPath: ", defaultEngineBinPath );
      let command = "./" + self.options.name; //+ " &";
      console.log( "[info] command: ", command );

      let logFile = path.join( config.publicPath, self.options.name + '.log' );
      let logStream = fs.createWriteStream( logFile, { flags : 'a' } );
      console.log( "[info] engine logFile: ", logFile );

      if ( !isExisted( path.join( defaultEngineBinPath, command ) ) ) {

        console.log( `[error] engine ${self.options.name} doesn't exist` );
        errorHandler( new Error( `[error] engine ${self.options.name} doesn't exist` ) );

      } else {

        let engineProcess = spawn( command, {
          cwd : defaultEngineBinPath
        } );

        // log engine output
        engineProcess.stdout.pipe( logStream );
        engineProcess.stderr.pipe( logStream );

        successHandler();
      }
    } );
  }

  /**
   * Stop engine
   * @return {Promise<boolean>} if stop successful, return true, otherwise return false
   */
  stop() {
    const self = this;

    return new Promise( ( resolve, reject )=> {

      const successHandler = ()=> {
        self.isStarted = false;
        self.status = FLOGO_ENGINE_STATUS.STOPPED;
        self.isProcessing = false;

        resolve( true );
      };

      const errorHandler = ( err ) => {
        console.error( "[error] Engine->stop. Error: ", err );

        self.isProcessing = false;
        reject( false );
      };

      self.isProcessing = true;
      self.status = FLOGO_ENGINE_STATUS.STOPPING;

      // try to get the process id
      // if cannot get the process id, considering as the engine is stopped.
      // otherwise, try to stop the engine.
      try {
        execSync( `pgrep ${self.options.name}` );

        try {
          execSync( `pgrep ${self.options.name} | xargs kill -9` );
          successHandler();
        } catch ( err ) {
          errorHandler( err );
        }

      } catch (err) {
        successHandler();
      }

    } );
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

    testEngine.init()
      .then( ()=> {
        resolve( testEngine );
      } )
      .catch( reject );
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

    buildEngine.init()
      .then( ()=> {
        resolve( buildEngine );
      } )
      .catch( reject );
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
