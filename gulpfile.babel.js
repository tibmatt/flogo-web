import gulp from 'gulp';
import path from 'path';
import runSequence from 'run-sequence';
import del from "del";
import gulpLoadPlugins from 'gulp-load-plugins';

//CONFIG
let CONFIG = {
};
// source code folder
CONFIG.source='src';
// client source code
CONFIG.client=path.join(CONFIG.source, 'client');
// server source code
CONFIG.server=path.join(CONFIG.source, 'server');
// generate dist folder
CONFIG.dist= 'dist';
CONFIG.public=path.join(CONFIG.dist, 'public');

CONFIG.clientLibs = [
  'd3/d3.js',
  'lodash/lodash.js',
  'systemjs/dist/system-polyfills.src.js',
  'reflect-metadata/Reflect.js',
  'es6-shim/es6-shim.js',
  'systemjs/dist/system.src.js',
  'angular2/bundles/angular2-polyfills.js',
  'rxjs/bundles/Rx.js',
  'angular2/bundles/angular2.js',
  'angular2/bundles/router.js',
  'angular2/bundles/http.js'
];

// load gulp plugins
const $ = gulpLoadPlugins();

gulp.task("default", ()=>{
  runSequence(
    ["dev"]
  )
});

gulp.task("dev", ()=>{
  runSequence(
    'clean:dev',
    'copy:dev',
    'build:ts:dev',
    'concat:lib'
  );
});

gulp.task("clean:dev", ()=>{
  del.sync(["public/**/*"], {cwd: CONFIG.dist});
});


//[Optional]
gulp.task("tslint", ()=>{

});

// Copy files
//gulp.task("copy:dev", ["copy:client:dev", "copy:server:dev"], ()=>{
gulp.task("copy:dev", ["copy:client:dev"], ()=>{

});

gulp.task("copy:client:dev", ()=>{
  gulp.src(['**/*', "!**/*.ts", "!**/*.js", "!**/*.js.map", "!**/node_modules/**/*"], {cwd: CONFIG.client})
    .pipe(gulp.dest(CONFIG.public))
});

gulp.task("copy:server:dev", ()=>{
  gulp.src(["**/*", "package.json", ".babelrc"], {cwd: CONFIG.server})
    .pipe(gulp.dest(CONFIG.dist))
});

gulp.task("build:ts:dev", ()=>{
  let _tsProject = $.typescript.createProject('tsconfig.json', {
    typescript: require('typescript')
  });
  return gulp.src(["../../typings/browser.d.ts", "**/*.ts", "!**/*.spec.ts", "!**/*.e2e.ts", "!node_modules/**/*.ts"], {cwd: CONFIG.client})
    .pipe($.typescript(_tsProject))
    .pipe(gulp.dest(CONFIG.public));
});

gulp.task("concat:lib", ()=>{
  gulp.src(CONFIG.clientLibs, {cwd: path.join(CONFIG.client, "node_modules")})
    .pipe($.concat("lib.js"))
    .pipe(gulp.dest(path.join(CONFIG.public, "js")))
});

gulp.task("uglify:lib", ()=>{
  gulp.src(path.join(CONFIG.public, "js", "lib.js"))
    .pipe($.uglify())
    .pipe(gulp.dest(path.join(CONFIG.public, "js")));
});

gulp.task("build:index:dev", ()=>{

});
