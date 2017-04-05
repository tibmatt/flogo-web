import { rmFolder } from '../common/utils/file';
import { config } from '../config/app-config';

export function cleanDb() {
  return Promise.all([
    rmFolder(config.apps.dbPath),
    rmFolder(config.indexer.dbPath),
  ]);
}
