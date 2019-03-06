import path from 'path';

import { Engine } from './engine';
import { logger, engineLogger } from '../../common/logging';
import { config } from '../../config/app-config';
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

function createEngine(engine, defaultFlogoDescriptorPath, skipPaletteInstall) {
  logger.warn('Engine does not exist. Creating...');
  return engine
    .create(defaultFlogoDescriptorPath)
    .then(() => {
      logger.info('New engine created');
      // when vendor provided it's not needed to install a palette
      if (skipPaletteInstall) {
        return Promise.resolve(true);
      }
      // TODO: add palette version
      const contribBundlePath = path.resolve(
        'src',
        'config',
        config.defaultEngine.defaultPalette
      );
      logger.info(`Will install contrib bundle at ${contribBundlePath}`);
      return engine.installContribBundle(contribBundlePath);
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
 * @param options.skipPaletteInstall {boolean} whether to install a palette or now
 * @param options.forceCreate {boolean} whether to create an engine irrespective of it's existence
 * @param options.defaultFlogoDescriptorPath {string} path to the default flogo application JSON
 * @param options.skipContribLoad {boolean} whether to refresh the list of contributions installed in the engine
 * @returns {*}
 */
export function initEngine(engine, options) {
  const forceInit = options && options.forceCreate;
  const defaultFlogoDescriptorPath =
    (options && options.defaultFlogoDescriptorPath) || config.defaultFlogoDescriptorPath;
  const skipContribLoad = options && options.skipContribLoad;
  const skipPaletteInstall = options && options.skipPaletteInstall;

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
        return createEngine(engine, defaultFlogoDescriptorPath, skipPaletteInstall);
      }
      return true;
    })
    .then(() => {
      if (skipContribLoad) {
        return true;
      }
      return engine.load().then(installedContribs => {
        const mapContribs = collection => collection.map(c => ({ ref: c.ref }));
        logger.info('installedContributions', {
          triggers: mapContribs(installedContribs.triggers),
          activities: mapContribs(installedContribs.activities),
          functions: mapContribs(installedContribs.functions),
        });
      });
    });
}
