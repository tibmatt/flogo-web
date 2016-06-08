import gulp from 'gulp';
import path from 'path';
import {CONFIG} from '../../config';
const browserSync = require('browser-sync').create();

gulp.task('dev.client.watch',  () => {
  browserSync.init({
    proxy:  {
      target: CONFIG.host
    }
  });

  gulp.watch(CONFIG.paths.ts, {cwd: CONFIG.paths.source.client}, ['dev.client.typescript']);
  gulp.watch(CONFIG.paths.less, {cwd: CONFIG.paths.source.client}, ['dev.client.styles']);
  gulp.watch(CONFIG.paths.assets, {cwd: CONFIG.paths.source.client}, ['dev.client.assets']);


  //reload browser when this files changes
  var files = [
    path.join(CONFIG.paths.dist.public, 'app/**/*.css'),
    path.join(CONFIG.paths.dist.public, 'app/**/*.html'),
    path.join(CONFIG.paths.dist.public, 'app/**/*.js')
  ];

  return gulp.watch(files)
    .on('change', browserSync.reload );
});
