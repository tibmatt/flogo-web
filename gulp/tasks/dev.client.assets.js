import gulp from 'gulp';
import changed from 'gulp-changed';
import print from 'gulp-print';

import {CONFIG} from '../config';

gulp.task('dev.client.assets', [], ()=> {
  let dest = CONFIG.paths.dist.public;
  return gulp.src(CONFIG.paths.assets, {cwd: CONFIG.paths.source.client})
    .pipe(changed(dest))
    .pipe(print())
    .pipe(gulp.dest(dest))
});


