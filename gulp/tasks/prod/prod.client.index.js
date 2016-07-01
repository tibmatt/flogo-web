import gulp from 'gulp';
import path from 'path';
import inject from 'gulp-inject';

import {CONFIG} from '../../config';


/**
 * Builds index.html file for production
 */
gulp.task('prod.client.index', 'Builds index.html file for production', () => {
  let originalIndex = path.join(CONFIG.paths.source.client, 'index.html');

  return gulp.src(originalIndex)
    .pipe(injectJsLibs())
    .pipe(gulp.dest(CONFIG.paths.dist.public));

});

function injectJsLibs() {
  let jsLibsPath = path.join(CONFIG.paths.dist.public);
  let sources = gulp.src(CONFIG.libs.dist.js.map(file => path.join(jsLibsPath, file)));
  return inject(sources, {relative: false, ignorePath: jsLibsPath});
}
