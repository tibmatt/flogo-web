import gulp from 'gulp';
import path from 'path';
import inject from 'gulp-inject';

import {CONFIG} from '../../config';

/**
 * Builds index.html file for development
 */
gulp.task('dev.client.index', () => {
  let originalIndex = path.join(CONFIG.paths.source.client, 'index.html');

  return gulp.src(originalIndex)
    .pipe(injectJsLibs())
    .pipe(gulp.dest(CONFIG.paths.dist.public));

});

function injectJsLibs() {
  let jsLibsPath = path.join(CONFIG.paths.source.client);
  let sources = gulp.src(CONFIG.libs.js, {cwd: jsLibsPath});
  return inject(sources, {relative: true, addPrefix: '/js'});
}
