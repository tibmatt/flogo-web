import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('dev.build', cb => runSequence(
  [
    'dev.client.lib',
    'dev.client.styles'
  ],
  'dev.client.typescript',
  'dev.client.index',
  'dev.client.assets',
  cb
));
