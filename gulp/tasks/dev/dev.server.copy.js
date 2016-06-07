import gulp from 'gulp';

import {CONFIG} from '../../config';

gulp.task('dev.server.copy', () => {
  return gulp.src(["**/*", "package.json", "!**/node_modules/**"], {cwd: CONFIG.paths.source.server})
    .pipe(gulp.dest(CONFIG.paths.dist.server));
});
