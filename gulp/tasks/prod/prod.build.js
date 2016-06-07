import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('prod.build', cb => runSequence(
  'prod.client.build',
  cb
));

gulp.task('prod.client.build', cb => runSequence(
  'prod.client.bundle',
  'prod.client.assets',
  'prod.client.less',
  'prod.client.index',
  cb
));


