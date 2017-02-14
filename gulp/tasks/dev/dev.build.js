import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('dev.build', 'Build client and server app for development', cb => runSequence('dev.server.build', 'dev.client.build', cb));

gulp.task('dev.client.build', 'Build client app for development', (cb)=> {
  return runSequence(
    'install.client.dev',
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
    'dev.server.transpile',
    'install.server.dev',
     cb);
});
