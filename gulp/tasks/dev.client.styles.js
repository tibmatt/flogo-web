import gulp from 'gulp';
import path from 'path';
import {CONFIG} from '../config';

import less from 'gulp-less';

gulp.task('dev.client.styles', () => {

  return gulp.src(['{assets,app,common}/**/*.less'], {cwd: CONFIG.paths.source.client})
    .pipe(less())
    .pipe(gulp.dest(path.join(CONFIG.paths.dist.public, 'app')));

});
