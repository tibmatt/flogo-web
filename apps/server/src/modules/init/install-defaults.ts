import { importApp, AppImporterFactory } from '../importer';
import { config } from '../../config/app-config';
import { readJSONFile } from '../../common/utils/file';

export function installDefaults(appImporterFactory: AppImporterFactory) {
  return readJSONFile(config.defaultAppJsonPath)
    .then(defaultApp => importApp(defaultApp, appImporterFactory))
    .catch(err => Promise.reject(err));
}
