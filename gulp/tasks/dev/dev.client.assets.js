import gulp from 'gulp';
import changed from 'gulp-changed';

import {CONFIG} from '../../config';

gulp.task('dev.client.assets', [], ()=> {
  let dest = CONFIG.paths.dist.public;
  return gulp.src(CONFIG.paths.assets, {cwd: CONFIG.paths.source.client})
    .pipe(changed(dest))
    .pipe(gulp.dest(dest))
});


