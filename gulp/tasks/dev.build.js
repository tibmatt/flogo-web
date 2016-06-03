import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('dev.build', ['dev.client.build', 'dev.server.build']);

gulp.task('dev.client.build', (cb)=> {
  return runSequence(
    'dev.client.install',
    'dev.client.lib',
    'dev.client.styles',
    'dev.client.typescript',
    'dev.client.assets',
    'dev.client.index',
    cb);
});


gulp.task('dev.server.build', cb => {
  return runSequence(
    'dev.server.install',
    'dev.server.copy'
    , cb);
});
