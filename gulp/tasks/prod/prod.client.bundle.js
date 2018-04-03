import gulp from 'gulp';
import path from 'path';
import { npmRun }  from '../../utils/npm-run';

import { CONFIG } from '../../config';

/**
 * Run only client tasks
 */
gulp.task('prod.client.bundle', 'Generate client bundle files', () => npmRun(
  'build',
  {
    scriptArgs: [
      '--output-path', path.resolve(CONFIG.paths.dist.public),
      '--progress', 'false',
    ],
    cwd: CONFIG.paths.source.client,
  }
));

