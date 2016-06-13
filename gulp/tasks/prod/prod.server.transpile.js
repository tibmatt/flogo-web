import gulp from 'gulp';
import changed from 'gulp-changed';
import babel from 'gulp-babel';
import path from 'path';

import {CONFIG} from '../../config';

gulp.task('prod.server.transpile', () => {

  return gulp.src(['**/*.js', '!**/node_modules/**','!**/data/**'], {cwd: CONFIG.paths.dist.server})
              .pipe(babel({
                presets: ['es2015']
              }))
              .pipe(gulp.dest(CONFIG.paths.dist.server));


});
