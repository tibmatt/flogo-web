let loader = require('./loader');
let commander = require('./commander');

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

};
