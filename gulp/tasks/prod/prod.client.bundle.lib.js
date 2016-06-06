import path from 'path';

import gulp from 'gulp';
import concat from 'gulp-concat';

import {CONFIG} from '../../config';

gulp.task('prod.client.bundle.lib', ()=>{
  let base = CONFIG.paths.dist.client;
  return gulp.src(CONFIG.libs.js, {cwd: base, base: base})
    .pipe(concat(CONFIG.bundles.lib))
    .pipe(gulp.dest(path.join(CONFIG.paths.dist.public, 'js')));
});
