import { AppsManager } from '../apps';
import { config } from '../../config/app-config';
import { readJSONFile } from '../../common/utils/file';
import { ResourceStorageRegistry } from '../resource-storage-registry';

export function installDefaults() {
  return installDefaultApps().catch(err => Promise.reject(err));
}

export function installDefaultApps() {
  return readJSONFile(config.defaultAppJsonPath)
    .then(defaultApp => AppsManager.import(defaultApp, ResourceStorageRegistry))
    .catch(err => Promise.reject(err));
}
