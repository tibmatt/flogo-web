import gulp from 'gulp';
import {CONFIG} from '../../config';

gulp.task('dev.server.watch', () => {
  gulp.watch(CONFIG.paths.serverSrc, {cwd: CONFIG.paths.source.server}, ['dev.server.copy']);
});
