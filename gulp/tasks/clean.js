import gulp from 'gulp';
import {CONFIG} from '../config';

import del from 'del';

/**
 * Delete application files from client and server dist folders to have a clean state for build process
 */
gulp.task('clean', ['clean.client', 'clean.server']);

gulp.task('clean.client', () => {
  return del.sync(['**/*', '!web.log', '!engine.log'], {cwd: CONFIG.paths.dist.public});
});

gulp.task('clean.server', () => {
  return del.sync(['**/*', '!node_modules/**', '!data/**', '!log.txt'], {cwd: CONFIG.paths.dist.server});
});

