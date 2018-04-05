import {copyFile, fileExists, inspectObj, rmFolder} from "../../../common/utils";
import path from 'path';
import omit from 'lodash/omit';
import {logger} from "../../../common/logging";
import {ERROR_TYPES, ErrorManager} from "../../../common/errors";

const INSTALLATION_STATE = {
  INIT: 'initializing',
  BACKUP: 'backing-up',
  INSTALL: 'installing-to',
  BUILD: 'building',
  COPYBIN: 'copying-binary',
  STOP: 'stopping',
  START: 'starting'
};

const SRC_FOLDER = 'src';
const BACKUP_SRC_FOLDER = 'backupsrc';

export class ContribInstallController {

  setupController(engine, remoteInstaller) {
    this.engine = engine;
    this.remoteInstaller = remoteInstaller;
    this.installState = INSTALLATION_STATE.INIT;
    return this;
  }

  /**
   * Install the contribution accessible in a URL (preferrably github URL) to the engine and restart the engine
   * @param url {string} URL path where the acitivy / trigger .json is located
   * @returns results {Object} results of installation
   * @returns results.success {array} array of successfully installed contribution urls
   * @returns results.fail {array} array of installation failed contribution urls
   */
  install(url) {
    let results;
    return this.installContributions(url)
      .then(installResults => {
        results = installResults;
        if (results.fail.length === 0) {
          return this.buildEngine()
            .then(() => {
              logger.debug(`Restarting the engine upon successful '${url}' installation.`);
              return this.restartEngineAfterBuild();
            });
        } else {
          return results;
        }
      }).then(() => this.removeBackup())
      .then(() => results)
      .catch(err => {
        logger.error(`[error] Encountered error while installing the '${url}' to the engine: `);
        logger.error(err);
        logger.debug(`Installation of '${url}' failed in '${this.installState}' step.`);
        logger.debug(`Starting engine recovery.`);
        return this.recoverEngine()
          .then(() => this.removeBackup())
          .then(() => {
            throw this.customInstallationError();
          });
      });
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

  restartEngineAfterBuild() {
    return this.stopEngine()
      .then(() => this.copyBinary())
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
      case INSTALLATION_STATE.COPYBIN:
        message = message + 'while copying the binary';
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
        message = message + `at ${this.installState} state`;
        break;
    }
    return ErrorManager.createRestError(message, {type});
  }

  recoverEngine() {
    let promise = null;
    switch (this.installState) {
      case INSTALLATION_STATE.BUILD:
      case INSTALLATION_STATE.COPYBIN:
      case INSTALLATION_STATE.STOP:
      case INSTALLATION_STATE.START:
        promise = this.recoverSource()
          .then(() => this.buildEngine())
          .then(() => this.restartEngineAfterBuild());
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
    const srcPath = path.join(this.engine.path, SRC_FOLDER);
    if (fileExists(srcPath)) {
      promise = copyFile(srcPath, path.join(this.engine.path, BACKUP_SRC_FOLDER));
    } else {
      promise = Promise.resolve(true);
    }
    return promise;
  }

  removeBackup() {
    logger.debug('Resource cleaning: removing the backup folder.');
    const pathToDel = path.join(this.engine.path, BACKUP_SRC_FOLDER);
    if (fileExists(pathToDel)) {
      rmFolder(pathToDel);
    }
  }

  recoverSource() {
    logger.debug('[Log] Recovering engine to previous working state..');
    let promise = null;
    const srcPath = path.join(this.engine.path, BACKUP_SRC_FOLDER);
    if (fileExists(srcPath)) {
      promise = copyFile(srcPath, path.join(this.engine.path, SRC_FOLDER));
    } else {
      promise = Promise.resolve(true);
    }
    return promise;
  }

  installToEngine(url) {
    logger.debug(`Started installing '${url}' to the engine.`);
    this.installState = INSTALLATION_STATE.INSTALL;
    return this.remoteInstaller.install([url], {engine: this.engine});
  }

  buildEngine() {
    logger.debug('Building engine.');
    this.installState = INSTALLATION_STATE.BUILD;
    return this.engine.buildOnly();
  }

  copyBinary() {
    logger.debug('Copying binary to bin folder.');
    this.installState = INSTALLATION_STATE.COPYBIN;
    return this.engine.copyToBinTest();
  }

  stopEngine() {
    logger.debug('Stopping enigne.');
    this.installState = INSTALLATION_STATE.STOP;
    return this.engine.stop();
  }

  startEngine() {
    logger.debug('Starting enigne.');
    this.installState = INSTALLATION_STATE.START;
    return this.engine.start();
  }
}
