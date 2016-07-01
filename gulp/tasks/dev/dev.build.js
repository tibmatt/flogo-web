import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('dev.build', 'Build client and server app for development', ['dev.client.build', 'dev.server.build']);

gulp.task('dev.client.build', 'Build client app for development', (cb)=> {
  return runSequence(
    'install.client',
    'dev.client.lib',
    'dev.client.config',
    'dev.client.styles',
    'dev.client.typescript',
    'dev.client.assets',
    'dev.client.index',
    cb);
});


gulp.task('dev.server.build', 'Build server app for development', cb => {
  return runSequence(
    'server.copy',
    'install.server',
     cb);
});
