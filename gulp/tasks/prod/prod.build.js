import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('prod.build', 'Build client and server app for production', cb => runSequence(
  'prod.client.build',
  'prod.server.build',
  cb
));

gulp.task('prod.client.build', 'Build client app for production', cb => runSequence(
  'prod.client.bundle',
  'prod.client.assets',
  'prod.client.less',
  'prod.client.index',
  'install.client',
  cb
));

gulp.task('prod.server.build', 'Build server app for production', cb => runSequence(
  'server.copy',
  'install.server',
  cb
));


