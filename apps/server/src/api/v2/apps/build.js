import { AppsManager } from '../../../modules/apps';
import { buildHandler } from '../shared/build-handler';
import { getNameForAppBinary } from '../shared/name-for-app-binary';

export const buildApp = buildHandler(async (context, options) => {
  const appId = context.params.appId;
  const buildResult = await AppsManager.build(appId, options);
  const fileName = getNameForAppBinary(buildResult.appName, options.compile);
  return { fileName, content: buildResult.data };
});
