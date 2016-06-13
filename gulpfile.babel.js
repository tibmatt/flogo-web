import gulp from 'gulp';
import runSequence from 'run-sequence';

import requireDir from 'require-dir';

// Automatically load tasks
requireDir('./gulp/tasks', {
  recurse: true
});

gulp.task('default', ['tmp-prod']);

gulp.task('prod', cb => {

  runSequence(
    'clean',
    'prod.build',
    'prod.start',
    cb
  );

});

gulp.task('tmp-prod', cb => {
  runSequence(
    'clean',
    'dev.build',
    'prod.start',
    cb
  );
});

gulp.task('dev', cb => {

  runSequence(
    'clean',
    'dev.build',
    'dev.watch',
    'dev.start',
    cb
  );

});


