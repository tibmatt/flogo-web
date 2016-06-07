import path from  'path';
import fs from 'fs';

import gulp from 'gulp';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import inlineTemplate from 'gulp-inline-ng2-template';

import ts from 'gulp-typescript';
import less from 'less';

import {CONFIG} from '../../config'

gulp.task('prod.client.bundle.app', () => {

  let tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript'),
    module: 'system',
    outFile: CONFIG.bundles.app
  });

  return gulp.src(CONFIG.paths.ts, {cwd: CONFIG.paths.source.client})
    .pipe(inlineTemplate({
      useRelativePaths: true,
      removeLineBreaks: true,
      customFilePath: convertExtensions,
      styleProcessor: processLess
    }))
    .pipe(ts(tsProject))
    .pipe(uglify({mangle:false}))
    //.pipe(concat(CONFIG.bundles.app))
    .pipe(gulp.dest(path.join(CONFIG.paths.dist.public, 'app')));

});

function convertExtensions(ext, path) {
  if(ext == '.css') {
    let lessPath = path.replace(/\.css$/, '.less');
    try {
      // check less version exists
      fs.accessSync(lessPath, fs.F_OK);
      return lessPath;
    } catch (e) {
      // nothing to do, it didn't find the less version
    }
  }
  return path;

}

function processLess(path, fileContent, cb) {

  less.render(fileContent, (err, output) => {
    onRender(err, output ? output.css : null);
  });

   function onRender(err, output) {
     return cb(err, output);
   }
}
