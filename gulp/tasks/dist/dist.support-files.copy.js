import path from 'path';

import gulp from 'gulp';
import rename from 'gulp-rename';

import {CONFIG} from '../../config';

const distPath = path.join(CONFIG.paths.dist.root, '..');

/**
 * Copies server files to dist folder
 */
gulp.task('dist.support-files', 'Copies server app files to dist folder', [
  'dist.support-files.copy.dockerfile',
  'dist.support-files.copy.start-script',
  'dist.support-files.copy.docker-compose'
],  () => {
  return gulp.src([
    '.dockerignore',
    'README.md'
  ], {})
    .pipe(gulp.dest(distPath));
});

gulp.task('dist.support-files.copy.dockerfile', () => {
  return gulp.src('Dockerfile.dist')
    .pipe(rename('Dockerfile'))
    .pipe(gulp.dest(distPath));
});

gulp.task('dist.support-files.copy.start-script', () => {
  return gulp.src('docker-start.dist.sh')
    .pipe(rename('docker-start.sh'))
    .pipe(gulp.dest(distPath));
});

gulp.task('dist.support-files.copy.docker-compose', () => {
  return gulp.src('docker-compose.dist.yml')
    .pipe(rename('docker-compose.yml'))
    .pipe(gulp.dest(distPath));
});
