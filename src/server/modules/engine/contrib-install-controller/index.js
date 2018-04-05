import {copyFile, fileExists, inspectObj, rmFolder} from "../../../common/utils";
import path from 'path';
import omit from 'lodash/omit';
import {logger} from "../../../common/logging";
import {ERROR_TYPES, ErrorManager} from "../../../common/errors";

const INSTALLATION_STATE = {
  INIT: 'initializing',
  BACKUP: 'backing up engine',
  INSTALL: 'installing',
  BUILD: 'building engine',
  STOP: 'stopping engine',
  START: 'starting engine'
};

const SRC_FOLDER = 'src';
const BACKUP_SRC_FOLDER = 'backupsrc';

export class ContribInstallController {
  constructor(testEngine, remoteInstaller) {
    this.testEngine = testEngine;
    this.remoteInstaller = remoteInstaller;
    this.installState = INSTALLATION_STATE.INIT;
  }

  async install(url) {
    try {
      let installResults = await this.installContributions(url);
      if (installResults.fail.length === 0) {
        logger.debug(`Restarting the engine upon successful '${url}' installation.`);
        await this.buildAndRestartEngine();
      }
      return Promise.resolve(installResults);
    } catch (err) {
      logger.error(`[error] Encountered error while installing the '${url}' to the engine: `);
      logger.error(err);
      logger.debug(`Installation of '${url}' failed in '${this.installState}' step.`);
      logger.debug(`Recovering the engine with old state.`);
      const customError = this.customInstallationError();
      await this.recoverEngine();
      throw customError;
    } finally {
      logger.debug('Resource cleaning: removing the backup folder.');
      await this.removeBackup();
    }
  }

  installContributions(url) {
    return this.createBackup()
      .then(() => this.installToEngine(url))
      .then((results) => {
        logger.log('[log] Installation results');
        inspectObj({
          success: results.success,
          fail: results.fail
        });
        return omit(results, ['details']);
      });
  }

  buildAndRestartEngine() {
    return this.stopEngine()
      .then(() => this.buildEngine())
      .then(() => this.startEngine());
  }

  customInstallationError() {
    let message = 'Installation failed ';
    let type = ERROR_TYPES.ENGINE.NOTHANDLED;
    switch (this.installState) {
      case INSTALLATION_STATE.BACKUP:
        message = message + `while taking backup of ${SRC_FOLDER}`;
        type = ERROR_TYPES.ENGINE.BACKUP;
        break;
      case INSTALLATION_STATE.INSTALL:
        message = message + 'while installing ';
        type = ERROR_TYPES.ENGINE.INSTALL;
        break;
      case INSTALLATION_STATE.BUILD:
        message = message + 'while building the engine';
        type = ERROR_TYPES.ENGINE.BUILD;
        break;
      case INSTALLATION_STATE.STOP:
        message = message + 'while stopping the engine';
        type = ERROR_TYPES.ENGINE.STOP;
        break;
      case INSTALLATION_STATE.START:
        message = message + 'while starting the engine';
        type = ERROR_TYPES.ENGINE.START;
        break;
      default:
        message = message + 'at unknown state';
        break;
    }
    return ErrorManager.createRestError(message, {type});
  }

  recoverEngine() {
    let promise = null;
    switch (this.installState) {
      case INSTALLATION_STATE.BUILD:
      case INSTALLATION_STATE.STOP:
      case INSTALLATION_STATE.START:
        promise = this.backupSource()
          .then(() => this.buildAndRestartEngine());
        break;
      default:
        promise = Promise.resolve(true);
        break;
    }
    return promise;
  }

  createBackup() {
    logger.debug(`Backing up '${SRC_FOLDER}' to '${BACKUP_SRC_FOLDER}'.`);
    this.installState = INSTALLATION_STATE.BACKUP;
    let promise = null;
    const srcPath = path.join(this.testEngine.path, SRC_FOLDER);
    if (fileExists(srcPath)) {
      promise = copyFile(srcPath, path.join(this.testEngine.path, BACKUP_SRC_FOLDER));
    } else {
      promise = Promise.resolve(true);
    }
    return promise;
  }

  removeBackup() {
    const pathToDel = path.join(this.testEngine.path, BACKUP_SRC_FOLDER);
    if (fileExists(pathToDel)) {
      rmFolder(pathToDel);
    }
  }

  backupSource() {
    logger.log('[Log] Recovering engine to previous working state..');
    let promise = null;
    const srcPath = path.join(this.testEngine.path, BACKUP_SRC_FOLDER);
    if (fileExists(srcPath)) {
      promise = copyFile(srcPath, path.join(this.testEngine.path, SRC_FOLDER));
    } else {
      promise = Promise.resolve(true);
    }
    return promise;
  }

  installToEngine(url) {
    logger.debug(`Started installing '${url}' to the engine.`);
    this.installState = INSTALLATION_STATE.INSTALL;
    return this.remoteInstaller.install([url], {engine: this.testEngine});
  }

  buildEngine() {
    logger.debug('Building engine.');
    this.installState = INSTALLATION_STATE.BUILD;
    return this.testEngine.build();
  }

  stopEngine() {
    logger.debug('Stopping enigne.');
    this.installState = INSTALLATION_STATE.STOP;
    return this.testEngine.stop();
  }

  startEngine() {
    logger.debug('Starting enigne.');
    this.installState = INSTALLATION_STATE.START;
    return this.testEngine.start();
  }
}
