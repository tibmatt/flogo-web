/**
 * Flogo web build process
 * Tasks are automatically loaded from '/gulp/tasks' folder.
 * Configuration located in '/gulp/config'
 */

import gulp from 'gulp';
import runSequence from 'run-sequence';

import requireDir from 'require-dir';

// Automatically load tasks
requireDir('./gulp/tasks', {
  recurse: true
});

/**
 * Default is prod mode
 */
// TODO: replace for prod mode
gulp.task('default', ['tmp-prod']);

/**
 * Start production mode
 */
gulp.task('prod', cb => {

  runSequence(
    'clean',
    'prod.build',
    'prod.start',
    cb
  );

});

/**
 * Start development mode
 */
gulp.task('dev', cb => {

  runSequence(
    'clean',
    'dev.build',
    'dev.watch',
    'dev.start',
    cb
  );

});


/**
 * Start without watches
 */
// TODO: Should be removed after inline template fix
gulp.task('tmp-prod', cb => {
  runSequence(
    'clean',
    'dev.build',
    'prod.start',
    cb
  );
});


