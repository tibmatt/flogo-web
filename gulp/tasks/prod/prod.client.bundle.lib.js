import path from 'path';

import gulp from 'gulp';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';

import {CONFIG} from '../../config';

/**
 * Generate bundle files from third party libraries.
 */
gulp.task('prod.client.bundle.lib', () => {
  let base = CONFIG.paths.source.client;
  return gulp.src(CONFIG.libs.dist.vendors, {cwd: base, base: base})
    .pipe(concat(CONFIG.bundles.lib))
    .pipe(uglify({mangle:false}))
    .pipe(gulp.dest(path.join(CONFIG.paths.dist.public, 'js')));
});
