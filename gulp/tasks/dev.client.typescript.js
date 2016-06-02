import gulp from 'gulp';
import ts from 'gulp-typescript';
import changed from 'gulp-changed';

import {CONFIG} from '../config';

let tsProject = ts.createProject('tsconfig.json', {
  typescript: require('typescript')
});

gulp.task('dev.client.typescript', [], () => {
  let dest = CONFIG.paths.dist.public;
  return gulp.src(CONFIG.paths.ts, {cwd: CONFIG.paths.source.client})
    .pipe(changed(dest, {extension: '.js'}))
    .pipe(ts(tsProject))
    .pipe(gulp.dest(dest));
});

