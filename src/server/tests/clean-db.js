import { rmFolder } from '../common/utils/file';
import { config } from '../config/app-config';

export function cleanDb() {
  return rmFolder(config.apps.dbPath);
}
