import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('prod.build', cb => runSequence(
  'prod.client.build',
  'prod.server.build',
  cb
));

gulp.task('prod.client.build', cb => runSequence(
  'prod.client.bundle',
  'prod.client.assets',
  'prod.client.less',
  'prod.client.index',
  cb
));

gulp.task('prod.server.build', cb => runSequence(
  'server.copy',
  cb
));


