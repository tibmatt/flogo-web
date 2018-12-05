// Where we store the local files
import path from 'path';
import { config } from '../../config/app-config';
import { ensureDir } from '../../common/utils/file';

const DIRS = [['engines'], ['db'], ['logs']];

export function ensureDefaultDirs() {
  return DIRS.reduce(
    (promiseChain, d) =>
      promiseChain.then(() => ensureDir(path.join(config.localPath, ...d))),
    Promise.resolve(true)
  );
}
