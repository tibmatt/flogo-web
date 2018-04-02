import {copyFile, fileExists, inspectObj, rmFolder} from "../../../common/utils";
import path from 'path';
import omit from 'lodash/omit';
import {INTSTALLATION_STATE} from "../../../common/constants";

export class ContribInstallController {
  constructor(testEngine, remoteInstaller) {
    this.testEngine = testEngine;
    this.remoteInstaller = remoteInstaller;
    this.installState = INTSTALLATION_STATE.INIT;
  }

  installContribution(urls) {
    let installResults;
    return this.createBackup()
      .then(() => this.installToEngine(urls))
      .then((results) => {
        installResults = omit(results, ['details']);
        console.log('[log] Installation results');
        inspectObj({
          success: results.success,
          fail: results.fail
        });
        return this.stopEngine();
      })
      .then(() => this.buildEngine())
      .then(() => {
        this.removeBackup();
        return this.startEngine()
      })
      .then(() => installResults)
      .catch((err) => {
        console.error(`[error] Encountered error while installing the ${this.getInstallType()} to the engine: `, err);
        this.recoverEngine();
        throw new Error(`Error while installing the ${this.getInstallType()} to the engine`);
      });
  }

  recoverEngine() {
    switch (this.installState) {
      default:
        break;
    }
    this.removeBackup();
  }

  getInstallType() {
    return this.remoteInstaller.opts.type || 'common';
  }

  createBackup() {
    this.installState = INTSTALLATION_STATE.BACKUP;
    return new Promise((resolve, reject) => {
      const srcPath = path.join(this.testEngine.path, 'src');
      if (fileExists(srcPath)) {
        copyFile(srcPath, path.join(this.testEngine.path, 'backupsrc'))
          .then(() => resolve(true))
          .catch((error) => reject(error));
      } else {
        resolve(true);
      }
    });
  }

  removeBackup() {
    const pathToDel = path.join(this.testEngine.path, 'backupsrc');
    if (fileExists(pathToDel)) {
      rmFolder(pathToDel);
    }
  }

  installToEngine(urls) {
    this.installState = INTSTALLATION_STATE.INSTALL;
    return this.remoteInstaller.install(urls, {engine: this.testEngine});
  }

  buildEngine() {
    this.installState = INTSTALLATION_STATE.BUILD;
    return this.testEngine.build();
  }

  stopEngine() {
    this.installState = INTSTALLATION_STATE.STOP;
    return this.testEngine.stop();
  }

  startEngine() {
    this.installState = INTSTALLATION_STATE.START;
    return this.testEngine.start();
  }
}
