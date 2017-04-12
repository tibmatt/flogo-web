import { AppsManager } from '../apps/index.v2';
import { config } from '../../config/app-config';
import { readJSONFile } from '../../common/utils/file';

export function installDefaults() {
  return Promise.resolve([
    installDefaultApps(),
  ]);
}

export function installDefaultApps() {
  return readJSONFile(config.defaultAppJsonPath)
    .then(defaultApp => AppsManager.import(defaultApp));
}
