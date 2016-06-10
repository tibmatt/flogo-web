import path from 'path';

import gulp from 'gulp';
import less from 'gulp-less';

import {CONFIG} from '../../config';

/**
 * Compile less files into css files for production.
 * Excludes component less files as they will be inlined into the components,
 */
gulp.task('prod.client.less', () => {
  let dest = path.join(CONFIG.paths.dist.public, 'assets');
  return gulp.src(CONFIG.paths.distLess, {cwd: CONFIG.paths.source.client})
    .pipe(less())
    .pipe(gulp.dest(dest));
});
