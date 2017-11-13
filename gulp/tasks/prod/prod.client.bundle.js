// import gulp from 'gulp';
// import sequence from 'run-sequence';

import gulp from 'gulp';
import path from 'path';
import { npmRun }  from '../../utils/npm-run';

import { CONFIG } from '../../config';

// /**
//  * Generate client bundle files
//  */
// gulp.task('prod.client.bundle', 'Generate client bundle files', cb => sequence(
//   'prod.client.bundle.lib',
//   'prod.client.bundle.app',
//   cb
// ));
// /**
//  * Generate client bundle files
//  */
// gulp.task('prod.client.bundle', 'Generate client bundle files', cb => sequence(
//   'prod.client.bundle.lib',
//   'prod.client.bundle.app',
//   cb
// ));

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

