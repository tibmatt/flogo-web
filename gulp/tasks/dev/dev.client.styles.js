import path from 'path';

import gulp from 'gulp';
import changed from 'gulp-changed';
import less from 'gulp-less';

import {CONFIG} from '../../config';

/**
 * Compiles less files to build folder
 */
gulp.task('dev.client.styles', () => {
  let dest = CONFIG.paths.dist.public;
  return gulp.src(CONFIG.paths.less, {cwd: CONFIG.paths.source.client})
    .pipe(changed(dest), {extension: '.css'})
    .pipe(less({
      paths: CONFIG.paths.lessImports
    }))
    .pipe(gulp.dest(dest));
});
