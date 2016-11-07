const path = require('path');

import {config} from '../../../config/app-config';
import {fileExists, rmFolder} from '../../../common/utils/file';

const loader = require('./loader');
const commander = require('./commander');
const configUpdater = require('./config-updater');
const exec = require('./exec-controller');

//TODO: status

module.exports = class Engine {

  constructor(path) {
    this.path = path;
    this.tasks = {
      activities: [],
      triggers: []
    }
  }

  load() {
    return loader.readAllTasks(this.path)
      .then(tasksData => this.tasks = tasksData);
  }

  create() {
    // todo: add support for lib version
    return commander.create(this.path);
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

  updateConfig(config, options = {}) {
    //this.isProcessing = true;
    //this.status = FLOGO_ENGINE_STATUS.UPDATING_CONFIG_JSON;

    return configUpdater.update.config(this.path, config, options)
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

    return configUpdater.update.triggersConfig(this.path, config, options)
      .catch(err => {
        return Promise.reject(err);
      });

  }

  build() {
    return commander.build(this.path);
  }

  start() {
    // todo: inject logger instead?
    return exec.start(this.path, this.getName(), { logPath: config.publicPath })
  }

  stop() {
    return exec.stop(this.getName());
  }

  getName() {
    return path.parse(this.path).name;
  }

  remove() {
    if(fileExists(this.path)) {
      return rmFolder(this.path);
    } else {
      return Promise.resolve(true);
    }
  }

};
