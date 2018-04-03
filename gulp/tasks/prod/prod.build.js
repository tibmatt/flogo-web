import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('prod.build', 'Build client and server package for production', cb => runSequence(
  // parser build happens as part of its own installation process
  'install.parser',
  'prod.server.build',
  'prod.client.build',
  cb
));

gulp.task('prod.client.build', 'Build client package for production', cb => runSequence(
  'install.client.dev',
  'prod.client.bundle',
  cb
));

gulp.task('prod.server.build', 'Build server package for production', cb => runSequence(
  'server.copy.assets',
  'install.server.dist',
  'prod.server.transpile',
  cb
));


