import gulp from 'gulp';
import {CONFIG} from '../../config';

gulp.task('dev.client.watch', () => {
  gulp.watch(CONFIG.paths.ts, {cwd: CONFIG.paths.source.client}, ['dev.client.typescript']);
  gulp.watch(CONFIG.paths.less, {cwd: CONFIG.paths.source.client}, ['dev.client.styles']);
  gulp.watch(CONFIG.paths.assets, {cwd: CONFIG.paths.source.client}, ['dev.client.assets']);
});
