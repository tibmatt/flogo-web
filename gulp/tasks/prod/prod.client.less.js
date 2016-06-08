import path from 'path';

import gulp from 'gulp';
import less from 'gulp-less';

import {CONFIG} from '../../config';

gulp.task('prod.client.less', () => {
  let dest = path.join(CONFIG.paths.dist.public, 'assets');
  return gulp.src(CONFIG.paths.distLess, {cwd: CONFIG.paths.source.client})
    .pipe(less())
    .pipe(gulp.dest(dest));
});
