const path = require('path');

import {config} from '../../config/app-config';
import {createFolder as ensureDir} from '../../common/utils/file';

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

  constructor(path, libVersion, runLogger) {
    this.path = path;
    this.tasks = {
      activities: [],
      triggers: []
    };
    this.libVersion = libVersion;
    this.runLogger = runLogger;
  }

  load() {
    return commander.list(this.path)
      .then(installedContribs => loader.loadMetadata(this.path, installedContribs))
      .then(contribMetadata => {
        this.tasks = contribMetadata;
        return contribMetadata;
      });
  }

  create(flogoDescriptorPath = null) {
    // todo: add support for lib version
    const options = { libVersion: this.libVersion };
    if (flogoDescriptorPath) {
      options.flogoDescriptor = flogoDescriptorPath;
    }
    console.time('engine:create');
    return commander
      .create(this.path, options)
      .then(() => Promise.all(
        [DIR_TEST_BIN, DIR_BUILD_BIN].map(dir => ensureDir(path.resolve(this.path, dir))),
      ))
      .then(result => {
        console.timeEnd('engine:create');
        return result;
      });
  }

  remove() {
    let deleteDir = () => removeDir(this.path);

    return this.stop()
      .then(deleteDir)
      .catch(() => Promise.resolve(deleteDir()));
  }

  exists() {
    return loader.exists(this.path);
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

  hasActivity(nameOrPath) {
    return this._hasItem(this.getActivities(), nameOrPath);
  }

  hasTrigger(nameOrPath) {
    return this._hasItem(this.getTriggers(), nameOrPath);
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

  /**
   *
   * @param options
   * @param {boolean} options.copyFlogoDescriptor
   * @return {Promise.<TResult>|*}
   */
  build(options) {
    options = Object.assign({}, { type: TYPE_TEST }, options);

    let buildTargetDir;
    if (options.type === TYPE_BUILD) {
      buildTargetDir = DIR_BUILD_BIN;
      // using bin instead of DIR_BUILD_BIN since there seems to be no options to specify different trigger config location for build
      // options.configDir = DIR_BUILD_BIN;
    } else {
      buildTargetDir = DIR_TEST_BIN;
    }

    delete options.type;
    options.target = path.join(this.path, buildTargetDir);

    return ensureDir(options.target)
      .then(() => commander.build(this.path, options));
  }

  start() {
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

  /**
   * Add a flow to engine
   * @param {string|Path} flowPath - the path to flow json
   * @param {string} [flowName] - the name of this flow
   * @return {boolean} if successful, return true, otherwise return false
   */
  addFlow(flowPath){
      return commander.add.flow(this.path, flowPath);
  }

  deleteAllInstalledFlows() {
    return loader
      .readAllFlowNames(this.path)
      .then(installedFlows => installedFlows.reduce((promise, flowName) => {
        return promise.then(commander.delete.flow(this.path, flowName));
      }, Promise.resolve(true)))
  }

  /**
   * Add/install a palette
   * @param palettePath Path to palette
   * @param options
   * @param options.version {string} version
   * @param options.noReload {boolean} Skip engine data reload
   */
  installPalette(palettePath, options) {
    options = Object.assign({ version: this.libVersion }, options);
    return this._installItem('palette', palettePath, options);
  }

  /**
   * Add/install a trigger
   * @param triggerPath Remote url or use local://path for local items
   * @param options
   * @param options.version {string} trigger versions
   * @param options.noReload {boolean} Skip engine data reload
   */
  addTrigger(triggerPath, options) {
    return this._installItem('trigger', triggerPath, options);
  }

  /**
   * Add/install an activity
   * @param activityPath Remote url or use local://path for local items
   * @param options
   * @param options.version {string} trigger versions
   * @param options.noReload {boolean} Skip engine data reload
   */
  addActivity(activityPath, options) {
    return this._installItem('activity', activityPath, options);
  }

  /**
   * Delete an installed trigger
   * @param {string} nameOrPath Trigger name or path (remote url or local://path)
   * @param options
   * @param options.noReload {boolean} Skip engine data reload
   */
  deleteTrigger(nameOrPath, options) {
    return this._deleteItem('trigger', nameOrPath, options);
  }

  /**
   * Delete an installed activity
   * @param {string} nameOrPath Trigger name or path (remote url or local://path)
   * @param options
   * @param options.noReload {boolean} Skip engine data reload
   */
  deleteActivity(nameOrPath, options) {
    return this._deleteItem('activity', nameOrPath, options);
  }

  _deleteItem(itemType, nameOrPath, options) {
    let promise = commander.delete[itemType](this.path, nameOrPath);
    let shouldReload = !(options && options.noReload);
    if (shouldReload) {
      promise = promise.then(() => this.load());
    }
    return promise;
  }

  _installItem(itemType, path, options) {
    let label = `engine:install:${itemType}`;
    console.time(label);
    options = Object.assign({ version: this.libVersion }, options);
    let promise = commander.add[itemType](this.path, path, options);
    let shouldReload = !(options && options.noReload);
    if (shouldReload) {
      promise = promise.then(() => this.load());
    }
    return promise.then(result => {
      console.timeEnd(label);
      return result;
    });
  }

  _hasItem(where, nameOrPath) {
    let item = (where || []).find(item => item.name == nameOrPath || item.path === nameOrPath)
    return !!item;
  }

}

// export type constants for outside use
Engine.TYPE_TEST = TYPE_TEST;
Engine.TYPE_BUILD = TYPE_BUILD;

export {Engine, TYPE_TEST, TYPE_BUILD};
export default Engine;
