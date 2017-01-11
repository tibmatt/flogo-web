import gulp from 'gulp';
import path from 'path';
import {CONFIG} from '../../config';
const browserSync = require('browser-sync').create('flogo-web');

/**
 * Watch client sources and execute the dev tasks when they change.
 * Also sets up browser live reloading.
 */
gulp.task('dev.client.watch', 'Watch client sources and execute the dev tasks when they change.',  () => {
  gulp.watch(CONFIG.paths.ts.dev, {cwd: CONFIG.paths.source.client}, ['dev.client.typescript']);
  gulp.watch(CONFIG.paths.less, {cwd: CONFIG.paths.source.client}, ['dev.client.styles']);
  gulp.watch(CONFIG.paths.assets, {cwd: CONFIG.paths.source.client}, ['dev.client.assets']);
  gulp.watch(CONFIG.paths.clientConfig, {cwd: CONFIG.paths.source.client}, ['dev.client.config']);

  //reload browser when these files changes
  var files = [
    path.join(CONFIG.paths.dist.public, 'app/**/*.css'),
    path.join(CONFIG.paths.dist.public, 'app/**/*.html'),
    path.join(CONFIG.paths.dist.public, 'app/**/*.js')
  ];

  return gulp.watch(files)
    .on('change', browserSync.reload );
});
