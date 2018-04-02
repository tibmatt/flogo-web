import {copyFile, fileExists, inspectObj, rmFolder} from "../../../common/utils";
import path from 'path';
import omit from 'lodash/omit';
import {INSTALLATION_STATE} from "../../../common/constants";

export class ContribInstallController {
  constructor(testEngine, remoteInstaller) {
    this.testEngine = testEngine;
    this.remoteInstaller = remoteInstaller;
    this.installState = INSTALLATION_STATE.INIT;
  }

  async install(urls) {
    try {
      let installResults = await this.installContributions(urls);
      if (installResults.fail.length === 0) {
        await this.buildAndRestartEngine();
      }
      return Promise.resolve(installResults);
    } catch (err) {
      console.error(`[error] Encountered error while installing the ${this.getInstallType()} to the engine: `, err);
      await this.recoverEngine();
      throw new Error(`Error while installing the ${this.getInstallType()} to the engine`);
    } finally {
      await this.removeBackup();
    }
  }

  installContributions(urls) {
    return this.createBackup()
      .then(() => this.installToEngine(urls))
      .then((results) => {
        console.log('[log] Installation results');
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

  recoverEngine() {
    let promise = null;
    switch (this.installState) {
      // case INSTALLATION_STATE.INSTALL:
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

  getInstallType() {
    return this.remoteInstaller.opts.type || 'common';
  }

  createBackup() {
    this.installState = INSTALLATION_STATE.BACKUP;
    let promise = null;
    const srcPath = path.join(this.testEngine.path, 'src');
    if (fileExists(srcPath)) {
      promise = copyFile(srcPath, path.join(this.testEngine.path, 'backupsrc'));
    } else {
      promise = Promise.resolve(true);
    }
    return promise;
  }

  removeBackup() {
    const pathToDel = path.join(this.testEngine.path, 'backupsrc');
    if (fileExists(pathToDel)) {
      rmFolder(pathToDel);
    }
  }

  backupSource() {
    console.log('[Log] Recovering engine to previous working state.');
    let promise = null;
    const srcPath = path.join(this.testEngine.path, 'backupsrc');
    if (fileExists(srcPath)) {
      promise = copyFile(srcPath, path.join(this.testEngine.path, 'src'));
    } else {
      promise = Promise.resolve(true);
    }
    return promise;
  }

  installToEngine(urls) {
    this.installState = INSTALLATION_STATE.INSTALL;
    return this.remoteInstaller.install(urls, {engine: this.testEngine});
  }

  buildEngine() {
    this.installState = INSTALLATION_STATE.BUILD;
    return this.testEngine.build();
  }

  stopEngine() {
    this.installState = INSTALLATION_STATE.STOP;
    return this.testEngine.stop();
  }

  startEngine() {
    this.installState = INSTALLATION_STATE.START;
    return this.testEngine.start();
  }
}
