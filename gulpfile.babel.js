import gulp from 'gulp';
import runSequence from 'run-sequence';

import requireDir from 'require-dir';

// Automatically load tasks
requireDir('./gulp/tasks', {
  recurse: true
});

gulp.task('default', ['prod']);

gulp.task('prod', cb => {

  runSequence(
    'dev.clean',
    'prod.build',
    //'dev.start',
    cb
  );

});

gulp.task('dev', cb => {

  runSequence(
    'dev.clean',
    'dev.build',
    'dev.watch',
    'dev.start',
    cb
  );

});


