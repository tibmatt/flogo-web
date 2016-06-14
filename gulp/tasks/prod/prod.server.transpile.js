import gulp from 'gulp';
import babel from 'gulp-babel';

import {CONFIG} from '../../config';

gulp.task('prod.server.transpile', 'Transpiles server code to run in production', () => {

  return gulp.src(['**/*.js', '!**/node_modules/**','!**/data/**'], {cwd: CONFIG.paths.dist.server})
              .pipe(babel({
                presets: ['es2015']
              }))
              .pipe(gulp.dest(CONFIG.paths.dist.server));


});
