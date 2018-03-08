import { readFile } from 'fs-extra';

import { logger } from '../../common/logging';
import { config } from './../../config/app-config';
import { getInitializedEngine } from './../../modules/init';
import { determinePathToVendor } from '../engine/determine-path-to-vendor';

import { AppsManager } from './index.v2';
import { writeJSONFile } from '../../common/utils';

export async function buildApp(appId, options) {
  const buildOptions = Object.assign({}, { optimize: true, embedConfig: true }, options);
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
  const buildResult = await createdEngine.build(buildOptions);
  const binaryStream = await readFile(buildResult.path);

  await createdEngine.remove();
  timer.done(`done build for ${JSON.stringify(buildOptions)}`);
  return { appName: exportedApp.name, data: binaryStream };
}

async function exportAppAndWriteToFileSystem(appId, outputToPath) {
  const exportedApp = await AppsManager.export(appId);
  await writeJSONFile(outputToPath, exportedApp);
  return exportedApp;
}
