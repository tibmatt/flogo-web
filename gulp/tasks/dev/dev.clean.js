import gulp from 'gulp';
import {CONFIG} from '../../config';

import del from 'del';

gulp.task('dev.clean', ['dev.clean.client', 'dev.clean.server']);

gulp.task('dev.clean.client', () => {
  return del.sync(['**/*', '!web.log', '!engine.log'], {cwd: CONFIG.paths.dist.public});
});

gulp.task('dev.clean.server', () => {
  return del.sync(['**/*', '!node_modules/**', '!data/**', '!log.txt'], {cwd: CONFIG.paths.dist.server});
});

