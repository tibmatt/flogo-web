import gulp from 'gulp';
import path from 'path';

import {CONFIG} from '../../config';

gulp.task('dev.client.lib', ()=>{
  let base = CONFIG.paths.source.client;
  let allJs = CONFIG.libs.js.concat(CONFIG.libs.bundles);
  return gulp.src(allJs, {cwd: base, base: base})
    .pipe(gulp.dest(path.join(CONFIG.paths.dist.public, 'js')));
});
