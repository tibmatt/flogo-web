import gulp from 'gulp';
import path from 'path';
import {CONFIG} from '../../config';
const browserSync = require('browser-sync').create();

/**
 * Watch client sources and execute the dev tasks when they change.
 * Also sets up browser live reloading.
 */
gulp.task('dev.client.watch',  () => {
  gulp.watch(CONFIG.paths.ts, {cwd: CONFIG.paths.source.client}, ['dev.client.typescript']);
  gulp.watch(CONFIG.paths.less, {cwd: CONFIG.paths.source.client}, ['dev.client.styles']);
  gulp.watch(CONFIG.paths.assets, {cwd: CONFIG.paths.source.client}, ['dev.client.assets']);

  browserSync.init({
      proxy:  {
        target: CONFIG.host
      }
    });

  //reload browser when these files changes
  var files = [
    path.join(CONFIG.paths.dist.public, 'app/**/*.css'),
    path.join(CONFIG.paths.dist.public, 'app/**/*.html'),
    path.join(CONFIG.paths.dist.public, 'app/**/*.js')
  ];

  return gulp.watch(files)
    .on('change', browserSync.reload );
});
