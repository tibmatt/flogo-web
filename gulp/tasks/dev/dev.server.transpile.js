import gulp from 'gulp';
import changed from 'gulp-changed';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import plumber from 'gulp-plumber';

import { CONFIG } from '../../config';

gulp.task('dev.server.transpile', 'Server transpile', () => {

  return gulp.src(['**/*.js', '!**/node_modules/**','!**/data/**'], {cwd: CONFIG.paths.source.server})
    .pipe(changed(CONFIG.paths.dist.server))
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(babel(CONFIG.babel))
    .pipe(sourcemaps.write('.'), { sourceRoot: CONFIG.paths.source.server })
    .pipe(gulp.dest(CONFIG.paths.dist.server));

});
