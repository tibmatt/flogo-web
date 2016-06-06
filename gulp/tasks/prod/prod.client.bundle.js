import gulp from 'gulp';
import sequence from 'run-sequence';

gulp.task('prod.client.bundle', cb => sequence(
  'prod.client.bundle.lib',
  'prod.client.bundle.app',
  cb
));
