import path from 'path';

import { Engine } from './engine';
import { logger, engineLogger } from '../../common/logging';
import { config } from '../../config/app-config';
import { installDeviceContributions } from './../init/install-device-contribs';
import { ContribInstallController } from '../contrib-install-controller';

const CONTRIB_INSTALLER = 'contribInstaller';
let engineRegistry = {};

/**
 * Gets initialized engine
 * @param enginePath {string} name/path of the engine
 * @param opts {object}
 * @param opts.forceCreate {boolean} default false
 * @returns {*}
 */
export function getInitializedEngine(enginePath, opts = {}) {
  if (engineRegistry[enginePath] && !opts.forceCreate) {
    return Promise.resolve(engineRegistry[enginePath]);
  }

  let libVersion;
  if (opts.noLib) {
    libVersion = null;
  } else {
    libVersion = opts.libVersion || config.libVersion;
  }
  const engine = new Engine(enginePath, libVersion, engineLogger);
  engineRegistry[enginePath] = engine;

  const initTimer = logger.startTimer();
  return initEngine(engine, opts).then(() => {
    engineRegistry[enginePath] = engine;
    initTimer.done('EngineInit');
    return engine;
  });
}

/**
 * Gets initialized ContributionInstallController instance and setup the controller's Engine and
 * RemoteInstaller instances which are used for installing a contribution
 * @param enginePath {string} name/path of the engine
 * @param installContribution {Function}
 * @returns {*} Instance of  ContribInstallController
 */
export function getContribInstallationController(enginePath, installContribution) {
  return getInitializedEngine(enginePath).then(engine => {
    if (!engineRegistry[CONTRIB_INSTALLER]) {
      engineRegistry[CONTRIB_INSTALLER] = new ContribInstallController();
    }
    return engineRegistry[CONTRIB_INSTALLER].setupController(engine, installContribution);
  });
}

function createEngine(engine, defaultFlogoDescriptorPath, useVendor) {
  logger.warn('Engine does not exist. Creating...');
  return engine
    .create(defaultFlogoDescriptorPath, useVendor)
    .then(() => {
      logger.info('New engine created');
      // when vendor provided it's not needed to install a palette
      if (useVendor) {
        return Promise.resolve(true);
      }
      // TODO: add palette version
      const palettePath = path.resolve('src', 'config', config.defaultEngine.defaultPalette);
      logger.info(`Will install palette at ${palettePath}`);
      return Promise.all([engine.installPalette(palettePath), installDeviceContributions()]);
    })
    .catch(error => {
      logger.error('Found error while initializing engine:');
      logger.error(error);
      throw error;
      // logger.error('Error initializing engine. Will try to clean up');
      // return engine.remove().then(() => {
      //   logger.info('Successful clean');
      //   throw new Error(error);
      // });
    });
}

/**
 *
 * @param engine {Engine}
 * @param options
 * @returns {*}
 */
export function initEngine(engine, options) {
  const forceInit = options && options.forceCreate;
  const useVendor = options && options.vendor;
  const defaultFlogoDescriptorPath =
    (options && options.defaultFlogoDescriptorPath) || config.defaultFlogoDescriptorPath;
  const skipContribLoad = options && options.skipContribLoad;

  return engine
    .exists()
    .then(engineExists => {
      if (engineExists && forceInit) {
        return engine.remove().then(() => true);
      }
      return !engineExists || forceInit;
    })
    .then(shouldCreateNewEngine => {
      if (shouldCreateNewEngine) {
        return createEngine(engine, defaultFlogoDescriptorPath, useVendor);
      }
      return true;
    })
    .then(() => {
      if (skipContribLoad) {
        return true;
      }
      return engine.load().then(installedContribs => {
        const mapContribs = collection => collection.map(c => ({ path: c.path, version: c.version }));
        logger.info('installedContributions', {
          triggers: mapContribs(installedContribs.triggers),
          activities: mapContribs(installedContribs.activities),
        });
      });
    });
}
