import gulp from 'gulp';
import babel from 'gulp-babel';

import {CONFIG} from '../../config';

gulp.task('prod.server.transpile', 'Transpiles server code to run in production', () => {
  return gulp.src(['**/*.js', '!**/node_modules/**','!**/data/**'], {cwd: CONFIG.paths.source.server})
    .pipe(babel(CONFIG.babel))
    .pipe(gulp.dest(CONFIG.paths.dist.server));
});
