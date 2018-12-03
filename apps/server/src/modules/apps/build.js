import { readFile } from 'fs-extra';

import { logger } from '../../common/logging';
import { config } from './../../config/app-config';
import { getInitializedEngine } from './../../modules/engine';
import { determinePathToVendor } from '../engine/determine-path-to-vendor';

import { writeJSONFile } from '../../common/utils';

const defaultBuildOptions = options => ({ optimize: true, embedConfig: true, ...options });

export async function buildBinary(appId, options) {
  return orchestrateBuild(appId, engine => engine.build(defaultBuildOptions(options)));
}

/**
 * @param exportApp {Function}
 * @param options
 * @param options.shimTriggerId
 * @return {Promise<T>}
 */
export async function buildPlugin(exportApp, options) {
  return orchestrateBuild(exportApp, engine => engine.buildPlugin(defaultBuildOptions(options))).then(result => ({
    ...result,
    trigger: options.shimTriggerId,
    plugin: true,
  }));
}

export async function orchestrateBuild(exportApp, execBuildCommand) {
  const engineOptions = {
    forceCreate: true,
    // noLib: true,
    skipContribLoad: true,
    defaultFlogoDescriptorPath: config.exportedAppBuild,
  };

  const timer = logger.startTimer();

  const [exportedApp, pathToVendor] = await Promise.all([
    exportAppAndWriteToFileSystem(exportApp, engineOptions.defaultFlogoDescriptorPath),
    determinePathToVendor(config.defaultEngine.path),
  ]);

  const createdEngine = await getInitializedEngine(config.appBuildEngine.path, {
    ...engineOptions,
    vendor: pathToVendor,
  });
  const buildResult = await execBuildCommand(createdEngine);
  const binaryStream = await readFile(buildResult.path);

  await createdEngine.remove();
  timer.done(`done build`);
  return { appName: exportedApp.name, data: binaryStream };
}

async function exportAppAndWriteToFileSystem(exportApp, outputToPath) {
  const exportedApp = await exportApp();
  await writeJSONFile(outputToPath, exportedApp);
  return exportedApp;
}
