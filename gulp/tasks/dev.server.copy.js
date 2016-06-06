import gulp from 'gulp';
import changed from 'gulp-changed';

import {CONFIG} from '../config';

gulp.task('dev.server.copy', () => {
  let dest = CONFIG.paths.dist.server;
  return gulp.src(['**/*.json'], {cwd: CONFIG.paths.source.server})
    .pipe(changed(dest))
    .pipe(gulp.dest(dest))
});
