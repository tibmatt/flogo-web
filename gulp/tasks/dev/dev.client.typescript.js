import path from 'path';

import gulp from 'gulp';
import ts from 'gulp-typescript';
import changed from 'gulp-changed';
import sourcemaps from 'gulp-sourcemaps';

import {CONFIG} from '../../config';

let tsProject = ts.createProject(path.join(CONFIG.paths.source.client, 'tsconfig.json'), {
  typescript: require('typescript')
});

/**
 * Compile typescript sources to build dir
 */
gulp.task('dev.client.typescript', 'Compile typescript sources to build dir', [], () => {
  let dest = CONFIG.paths.dist.public;

  return gulp.src(CONFIG.paths.ts.dev, {cwd: CONFIG.paths.source.client})
    .pipe(sourcemaps.init())
    .pipe(changed(dest, {extension: '.js'}))
    .pipe(tsProject())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest));
});

