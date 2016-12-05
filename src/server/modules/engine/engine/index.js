const path = require('path');

import {config} from '../../../config/app-config';
import {createFolder as ensureDir} from '../../../common/utils/file';

import {removeDir} from './file-utils';

const loader = require('./loader');
const commander = require('./commander');
const configUpdater = require('./config-updater');
const exec = require('./exec-controller');

const DIR_TEST_BIN = 'bin-test';
const DIR_BUILD_BIN = 'bin-build';

const TYPE_TEST = 'test';
const TYPE_BUILD = 'build';

//TODO: status

class Engine {

  constructor(path, runLogger) {
    this.path = path;
    this.tasks = {
      activities: [],
      triggers: []
    };
    this.runLogger = runLogger;
  }

  load() {
    return loader.readAllTasks(this.path)
      .then(tasksData => this.tasks = tasksData);
  }

  create() {
    // todo: add support for lib version
    return commander
      .create(this.path)
      .then(() => Promise.all(
        [
          DIR_TEST_BIN,
          DIR_BUILD_BIN
        ].map(
          dir => ensureDir(path.resolve(this.path, dir))
        )
      ));
  }

  exists() {
    return loader.exists(this.path);
  }

  installPalette(palettePath, options) {
    return commander.add.palette(this.path, palettePath, options);
  }

  getTasks() {
    return this.tasks;
  }

  setTasks(tasks) {
    this.tasks = tasks;
  }

  getActivities() {
    return this.tasks.activities;
  }

  getTriggers() {
    return this.tasks.triggers;
  }

  /**
   *
   * @param config
   * @param options
   * @param options.type build or test
   * @returns {*}
   */
  updateConfig(config, options = {}) {
    //this.isProcessing = true;
    //this.status = FLOGO_ENGINE_STATUS.UPDATING_CONFIG_JSON;

    options = Object.assign({}, {type: TYPE_TEST}, options);
    // using bin instead of DIR_BUILD_BIN since there seems to be no options to specify different trigger config location for build
    options.target = options.type == TYPE_BUILD ? 'bin' : DIR_TEST_BIN;
    delete options.type;

    return ensureDir(path.join(this.path, options.target))
      .then(() => configUpdater.update.config(this.path, config, options))
      .catch(err => {
        return Promise.reject(err);
      });

  }

  /**
   * update the triggers.json file in the engine/bin folder.
   * @param {object} config - the json object for triggers.json. Default it will merge with triggers.json then write to triggers.json.
   * @param {Array} config.triggers - the configuration of triggers
   * @param {object} options
   * @param {boolean} options.overwrite default false - whether use options to overwrite whole triggers.json. This means options == triggers.json
   */
  updateTriggersConfig(config, options = {}) {
    //this.isProcessing = true;
    //this.status = FLOGO_ENGINE_STATUS.UPDATING_TRIGGER_JSON;

    options = Object.assign({}, {type: TYPE_TEST}, options);
    // using bin instead of DIR_BUILD_BIN since there seems to be no options to specify different trigger config location for build
    options.target = options.type == TYPE_BUILD ? 'bin' : DIR_TEST_BIN;
    delete options.type;

    return ensureDir(path.join(this.path, options.target))
      .then(() => configUpdater.update.triggersConfig(this.path, config, options))
      .catch(err => {
        return Promise.reject(err);
      });

  }

  build(options) {
    options = Object.assign({}, {type: TYPE_TEST}, options);

    let buildTargetDir;
    if (options.type == TYPE_BUILD) {
      buildTargetDir = DIR_BUILD_BIN;
      // using bin instead of DIR_BUILD_BIN since there seems to be no options to specify different trigger config location for build
      //options.configDir = DIR_BUILD_BIN;
    } else {
      buildTargetDir = DIR_TEST_BIN;
    }

    delete options.type;
    options.target = path.join(this.path, buildTargetDir);

    return ensureDir(options.target)
      .then(() => commander.build(this.path, options));
  }

  start() {
    // todo: inject logger instead?
    return exec.start(this.path, this.getName(), {
      binDir: DIR_TEST_BIN,
      logPath: config.publicPath,
      logger: this.runLogger
    })
  }

  stop() {
    return exec.stop(this.getName());
  }

  getName() {
    return path.parse(this.path).name;
  }

  remove() {
    return removeDir(this.path);
  }

  deleteAllInstalledFlows() {
    return loader
      .readAllFlowNames(this.path)
        .then(installedFlows => installedFlows.reduce((promise, flowName) => {
          return promise.then(commander.delete.flow(this.path, flowName));
        }, Promise.resolve(true)))
  }

  /**
   * Add a flow to engine
   * @param {string|Path} flowPath - the path to flow json
   * @param {string} [flowName] - the name of this flow
   * @return {boolean} if successful, return true, otherwise return false
   */
  addFlow(flowPath){
      return commander.add.flow(this.path, flowPath);
  }

}

// export type constants for outside use
Engine.TYPE_TEST = TYPE_TEST;
Engine.TYPE_BUILD = TYPE_BUILD;

export {Engine, TYPE_TEST, TYPE_BUILD};
export default Engine;
