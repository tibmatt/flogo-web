// Where we store the local files
import {isDirectory, createFolder as createDirectory} from '../../common/utils'

const LOCAL_DIR = 'local/engines';

export function ensureDefaultDirs() {
  return !isDirectory(LOCAL_DIR) ? createDirectory(LOCAL_DIR) : Promise.resolve(true);
}
