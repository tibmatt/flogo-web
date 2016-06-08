import path from 'path';

import gulp from 'gulp';
import changed from 'gulp-changed';
import less from 'gulp-less';

import {CONFIG} from '../../config';

gulp.task('dev.client.styles', () => {
  let dest = CONFIG.paths.dist.public;
  return gulp.src(CONFIG.paths.less, {cwd: CONFIG.paths.source.client})
    .pipe(changed(dest), {extension: '.css'})
    .pipe(less())
    .pipe(gulp.dest(dest));
});
