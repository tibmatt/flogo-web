import { readFile } from 'fs-extra';

import { logger } from '../../common/logging';
import { config } from './../../config/app-config';
import { getInitializedEngine } from './../../modules/init';
import { determinePathToVendor } from '../engine/determine-path-to-vendor';

import { AppsManager } from './index';
import { writeJSONFile } from '../../common/utils';

const defaultBuildOptions = options => ({ optimize: true, embedConfig: true, ...options });

export async function buildBinary(appId, options) {
  return orchestrateBuild(appId, (engine) => engine.build(defaultBuildOptions(options)));
}

/**
 * @param appId
 * @param options
 * @param options.shimTriggerId
 * @return {Promise<T>}
 */
export async function buildPlugin(appId, options) {
  return orchestrateBuild(appId, (engine) => engine.buildPlugin(defaultBuildOptions(options)))
    .then(result => ({ ...result, trigger: options.shimTriggerId, plugin: true }));
}

export async function orchestrateBuild(appId, execBuildCommand) {
  const engineOptions = {
    forceCreate: true,
    // noLib: true,
    skipContribLoad: true,
    defaultFlogoDescriptorPath: config.exportedAppBuild,
  };

  const timer = logger.startTimer();

  const [exportedApp, pathToVendor] = await Promise.all([
    exportAppAndWriteToFileSystem(appId, engineOptions.defaultFlogoDescriptorPath),
    determinePathToVendor(config.defaultEngine.path),
  ]);

  const createdEngine = await getInitializedEngine(
    config.appBuildEngine.path,
    { ...engineOptions, vendor: pathToVendor },
  );
  const buildResult = await execBuildCommand(createdEngine);
  const binaryStream = await readFile(buildResult.path);

  await createdEngine.remove();
  timer.done(`done build`);
  return { appName: exportedApp.name, data: binaryStream };
}

async function exportAppAndWriteToFileSystem(appId, outputToPath) {
  const exportedApp = await AppsManager.export(appId);
  await writeJSONFile(outputToPath, exportedApp);
  return exportedApp;
}
