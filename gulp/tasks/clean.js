import gulp from 'gulp';
import {CONFIG} from '../config';

import del from 'del';

/**
 * Delete application files from client and server dist folders to have a clean state for build process
 */
gulp.task('clean', 'Delete application files from client and server dist folders to have a clean state for build process', ['clean.client', 'clean.server']);

gulp.task('clean.client', 'Delete application files from client dist folder', () => {
  return del.sync(['**/*', '!node_modules/**', '!web.log', '!engine.log'], { cwd: CONFIG.paths.dist.public, force: true });
});

gulp.task('clean.server', 'Delete application files from server dist folder', () => {
  return del.sync(['**/*', '!local/**', '!node_modules/**', '!docker-shared/**', '!log.txt'], { cwd: CONFIG.paths.dist.server, force: true });
});

