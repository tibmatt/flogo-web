import { join } from 'path';
import { mkdirSync } from 'fs';

import { config } from '../config/app-config';

const DIRS = [['engines'], ['db'], ['logs']];

export function ensureDefaultDirsSync() {
  DIRS.forEach(d => ensureDirSync(join(config.localPath, ...d)));
}

function ensureDirSync(dirpath) {
  try {
    mkdirSync(dirpath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}
