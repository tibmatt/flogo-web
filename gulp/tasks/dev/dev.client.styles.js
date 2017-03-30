import gulp from 'gulp';
import plumber from 'gulp-plumber';
import changed from 'gulp-changed';
import less from 'gulp-less';

import {CONFIG} from '../../config';

/**
 * Compiles less files to build folder
 */
gulp.task('dev.client.styles', 'Compiles less files to build folder', () => {
  let dest = CONFIG.paths.dist.public;
  return gulp.src(CONFIG.paths.less, {cwd: CONFIG.paths.source.client})
    .pipe(changed(dest), {extension: '.css'})
    .pipe(plumber())
    .pipe(less({
      paths: CONFIG.paths.lessImports
    }))
    .pipe(gulp.dest(dest));
});
