import gulp from 'gulp';
import runSequence from 'run-sequence';

/**
 * Watch server and client sources and execute the dev tasks when they change
 */
gulp.task('dev.watch', cb => runSequence('dev.client.watch', 'dev.server.watch', cb));
