import path from  'path';
import fs from 'fs';

import gulp from 'gulp';
import inlineTemplate from 'gulp-inline-ng2-template';
import ts from 'gulp-typescript';
import filter from 'gulp-filter';

import less from 'less';

import {CONFIG} from '../../config'

/**
 * Generate app bundle file.
 * Makes a single javascript file from app and library sources.
 */
gulp.task('prod.client.bundle.app', ['prod.client.bundle.app.ts'], cb => {

  let Builder = require('systemjs-builder');
  let builder = new Builder('', path.join(CONFIG.paths.source.client, 'systemjs.config.js'));

  Promise.all([
    // app bundle
    builder.buildStatic('main/main.js + main/app/**/**.js + main/common/**/**.js', path.join(CONFIG.paths.dist.public, 'app.bundle.js'), {minify: true, sourceMaps: true, lowResSourceMaps: true, encodeNames: true, rollup: true})
  ])
    .then(() => cb())
    .catch(err => cb(err))
  ;

});

/**
 * Compile app's typescript files to javascript and inline html templates and styles
 */
gulp.task('prod.client.bundle.app.ts', () => {

  let tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
    //outFile: CONFIG.bundles.app
  });

  let componentFilter = filter('**/*.component.{js,ts}', {restore: true});

  return gulp.src(CONFIG.paths.ts, {cwd: CONFIG.paths.source.client})
    .pipe(componentFilter)
    .pipe(inlineTemplate({
      useRelativePaths: true,
      removeLineBreaks: true,
      customFilePath: convertExtensions,
      styleProcessor: processLess
    }))
    .pipe(componentFilter.restore)
    .pipe(ts(tsProject))
    //.pipe(uglify({mangle:false}))
    //.pipe(concat(CONFIG.bundles.app))
    .pipe(gulp.dest(path.join(CONFIG.paths.dist.public, 'build')));

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
