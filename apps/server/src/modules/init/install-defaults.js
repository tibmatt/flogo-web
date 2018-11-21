import { AppsManager } from '../apps';
import { config } from '../../config/app-config';
import { readJSONFile } from '../../common/utils/file';
import { installDeviceContributions } from '../init/install-device-contribs';

export function installDefaults() {
  return Promise.resolve([
    installDefaultApps(),
    installDeviceContributions()
  ]);
}

export function installDefaultApps() {
  return readJSONFile(config.defaultAppJsonPath)
    .then(defaultApp => AppsManager.import(defaultApp));
}
