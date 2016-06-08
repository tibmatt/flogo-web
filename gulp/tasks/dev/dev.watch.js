import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('dev.watch', cb => runSequence('dev.client.watch', 'dev.server.watch', cb));
