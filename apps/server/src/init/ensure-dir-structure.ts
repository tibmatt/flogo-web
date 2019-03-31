import { join } from 'path';
import { mkdirSync } from 'fs';

import { config } from '../config/app-config';
/*
Array of arrays to allow subpath creation, for example:
[['flat'], [ 'my', 'nested', 'folder' ]]
Will create:
|- flat/
|- my/
    |-- nested /
              |---- folder/
 */
[['engines'], ['db'], ['logs']].forEach(d =>
  mkdirSync(join(config.localPath, ...d), { recursive: true })
);
