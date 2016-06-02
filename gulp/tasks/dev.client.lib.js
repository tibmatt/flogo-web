import gulp from 'gulp';
import path from 'path';
import {CONFIG} from '../config';

gulp.task('dev.client.lib', ()=>{
  let base = CONFIG.paths.source.client;
  return gulp.src(CONFIG.libs.js, {cwd: base, base: base})
    .pipe(gulp.dest(path.join(CONFIG.paths.dist.public, 'js')));
});
