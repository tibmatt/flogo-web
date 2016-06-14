import gulp from 'gulp';

import {CONFIG} from '../../config';

/**
 * Copies config files to client dist folder
 */
gulp.task('dev.client.config', 'Copies config files to client dist folder', () => {
  let base = CONFIG.paths.source.client;
  return gulp.src(['dev.env.js', 'systemjs.config.js'], {cwd: base, base: base})
    .pipe(gulp.dest(CONFIG.paths.dist.public));
});
