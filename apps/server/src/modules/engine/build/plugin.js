import { join } from 'path';
import { build } from '../commander/build';
import { findFirstChildDir } from '../file-utils';
import { logger } from '../../../common/logging';

const HANDLER_FILE_NAME = 'handler.zip';

export function buildPlugin(enginePath, opts) {
  return build(enginePath, opts)
    .then(out => logger.debug(`[log] build output: ${out}`))
    .then(() => findFirstChildDir(join(enginePath, 'src')))
    .then(srcDir => {
      // srcDir is </path/to/engine>/src/<engineName>/
      return { path: join(srcDir, HANDLER_FILE_NAME) };
    });
}
