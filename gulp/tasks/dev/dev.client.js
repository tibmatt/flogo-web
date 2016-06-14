import gulp from 'gulp';
import runSequence from 'run-sequence';

/**
 * Run only client tasks
 */
gulp.task('dev.client', 'Run only client tasks', cb => runSequence(
  'clean.client',
  'dev.client.build',
  'dev.client.watch',
  cb
));
