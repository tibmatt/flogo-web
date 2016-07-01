import gulp from 'gulp';
import sequence from 'run-sequence';

/**
 * Generate client bundle files
 */
gulp.task('prod.client.bundle', 'Generate client bundle files', cb => sequence(
  'prod.client.bundle.lib',
  'prod.client.bundle.app',
  cb
));
