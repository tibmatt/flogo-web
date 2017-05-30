import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('dev.build', 'Build client and server app for development', ['dev.server.build']);

gulp.task('dev.server.build', 'Build server app for development', cb => {
  return runSequence(
    'server.copy',
    'dev.server.transpile',
    'install.server.dev',
     cb);
});
