import * as path from 'path';

import { config } from '../../config/app-config';
import { createFolder as ensureDir } from '../../common/utils/file';

import { copyBinaryToDestination, removeDir } from './file-utils';
import { processHost } from '../../common/utils/process';
import { buildAndCopyBinary } from './build/binary';
import { buildPlugin } from './build/plugin';

import { loader } from './loader';
import { commander } from './commander';
import { execController as exec } from './exec-controller';

const DIR_TEST_BIN = 'bin-test';
const DIR_BUILD_BIN = 'bin-build';

const TYPE_TEST = 'test';
const TYPE_BUILD = 'build';

const DEFAULT_LIBS = [
  'github.com/TIBCOSoftware/flogo-contrib/activity/log',
  'github.com/TIBCOSoftware/flogo-lib/app/resource',
];

interface TaskCollections {
  activities: object[];
  triggers: object[];
}
type Options = Record<string, any>;

class Engine {
  static TYPE_TEST: string;
  static TYPE_BUILD: string;

  private readonly hostExt: string;
  private libVersion: string;
  private path: string;
  private runLogger: object;
  private tasks: { activities: object[]; triggers: object[] };

  constructor(pathToEngine: string, libVersion: string, runLogger: object) {
    this.path = pathToEngine;
    this.hostExt = processHost.getExtensionForExecutables();
    this.tasks = {
      activities: [],
      triggers: [],
    };
    this.libVersion = libVersion;
    this.runLogger = runLogger;
  }

  load() {
    return commander
      .list(this.path)
      .then(installedContribs => {
        return loader.loadMetadata(this.path, installedContribs);
      })
      .then((contribMetadata: TaskCollections) => {
        this.tasks = contribMetadata;
        return contribMetadata;
      });
  }

  create(flogoDescriptorPath = null, vendor = null) {
    // todo: add support for lib version
    const options: Record<string, any> = {
      libVersion: this._buildLibsOption(),
    };
    if (flogoDescriptorPath) {
      options.flogoDescriptor = flogoDescriptorPath;
    }
    if (vendor) {
      options.vendor = vendor;
    }
    console.time('engine:create');
    return commander
      .create(this.path, options)
      .then(() =>
        Promise.all(
          [DIR_TEST_BIN, DIR_BUILD_BIN].map(dir =>
            ensureDir(path.resolve(this.path, dir))
          )
        )
      )
      .then((result: any) => {
        console.timeEnd('engine:create');
        return result;
      });
  }

  remove() {
    const deleteDir = () => removeDir(this.path);

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

  setTasks(tasks: TaskCollections) {
    this.tasks = tasks;
  }

  getActivities() {
    return this.tasks.activities;
  }

  getTriggers() {
    return this.tasks.triggers;
  }

  hasActivity(nameOrPath: string) {
    return this._hasItem(this.getActivities(), nameOrPath);
  }

  hasTrigger(nameOrPath: string) {
    return this._hasItem(this.getTriggers(), nameOrPath);
  }

  /**
   *
   * @param options
   * @param {boolean} options.copyFlogoDescriptor
   * @return {Promise.<TResult>|*}
   * @deprecated
   */
  build(options: Options) {
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

    return ensureDir(options.target).then(() => buildAndCopyBinary(this.path, options));
  }

  buildPlugin(options: Options) {
    return ensureDir(path.join(this.path, DIR_BUILD_BIN)).then(() =>
      buildPlugin(this.path, options)
    );
  }

  buildOnly(options: Options) {
    return commander.build(this.path, options);
  }

  copyToBinTest() {
    const targetDir = path.join(this.path, DIR_TEST_BIN);
    return ensureDir(targetDir).then(() => copyBinaryToDestination(this.path, targetDir));
  }

  start() {
    return exec.start(this.path, this.getExecutableName(), {
      binDir: DIR_TEST_BIN,
      logPath: config.publicPath,
      logger: this.runLogger,
    });
  }

  stop() {
    return exec.stop(this.getExecutableName());
  }

  getExecutableName() {
    return `${path.parse(this.path).name}${this.hostExt}`;
  }

  /**
   * Add a flow to engine
   * @param {string|Path} flowPath - the path to flow json
   * @param {string} [flowName] - the name of this flow
   * @return {boolean} if successful, return true, otherwise return false
   */
  addFlow(flowPath: string) {
    return commander.add.flow(
      this.path,
      flowPath
    );
  }

  /**
   * Add/install a palette
   * @param palettePath Path to palette
   * @param options
   * @param options.version {string} version
   */
  installPalette(palettePath: string, options: Options) {
    options = Object.assign(
      {
        /* version: this.libVersion */
      },
      options
    );
    return this._installItem('palette', palettePath, options);
  }

  /**
   * Add/install a trigger
   * @param triggerPath Remote url or use local://path for local items
   * @param options
   * @param options.version {string} trigger versions
   */
  addTrigger(triggerPath: string, options: Options) {
    return this._installItem('trigger', triggerPath, options);
  }

  /**
   * Add/install an activity
   * @param activityPath Remote url or use local://path for local items
   * @param options
   * @param options.version {string} trigger versions
   */
  addActivity(activityPath: string, options: Options) {
    return this._installItem('activity', activityPath, options);
  }

  /**
   * Delete an installed trigger
   * @param {string} nameOrPath Trigger name or path (remote url or local://path)
   * @param options
   */
  deleteTrigger(nameOrPath: string, options: Options) {
    return this._deleteItem('trigger', nameOrPath, options);
  }

  /**
   * Delete an installed activity
   * @param {string} nameOrPath Trigger name or path (remote url or local://path)
   * @param options
   */
  deleteActivity(nameOrPath: string, options: Options) {
    return this._deleteItem('activity', nameOrPath, options);
  }

  _deleteItem(itemType: string, nameOrPath: string, options: Options) {
    return commander.delete[itemType](this.path, nameOrPath);
  }

  _installItem(itemType: string, ref: string, options: Options) {
    const label = `engine:install:${itemType}`;
    console.time(label);
    options = { ...options };
    return commander.add[itemType](this.path, ref, options).then((result: any) => {
      console.timeEnd(label);
      return result;
    });
  }

  _hasItem(where: { name?: string; path?: string }[], nameOrPath: string) {
    const foundItem = (where || []).find(
      item => item.name === nameOrPath || item.path === nameOrPath
    );
    return !!foundItem;
  }

  _buildLibsOption() {
    const libConstraint = this.libVersion ? `@${this.libVersion}` : '';
    return DEFAULT_LIBS.map(lib => `${lib}${libConstraint}`).join(',');
  }
}

// export type constants for outside use
Engine.TYPE_TEST = TYPE_TEST;
Engine.TYPE_BUILD = TYPE_BUILD;

export { Engine, TYPE_TEST, TYPE_BUILD };
export default Engine;
