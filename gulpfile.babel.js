import gulp from 'gulp';
import runSequence from 'run-sequence';

import requireDir from 'require-dir';

requireDir('./gulp/tasks', {
  recurse: true
});

gulp.task('default', ['prod']);

gulp.task('prod', () => {

  runSequence([
    'prod.clean',
    'prod.build',
    'prod.watch'
  ]);

});

gulp.task('dev', () => {

  runSequence([
    'dev.clean',
    'dev.build',
    'dev.watch'
  ]);

});


