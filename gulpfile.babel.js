import gulp from 'gulp';
import path from 'path';
import cp from "child_process";
import runSequence from 'run-sequence';
import del from "del";
import gulpLoadPlugins from 'gulp-load-plugins';

var server, db;

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
CONFIG.serverDist=path.join(CONFIG.dist, 'server');

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
  'angular2/bundles/http.js',
  'postal/lib/postal.js',
  'pouchdb/dist/pouchdb.js'
];

// load gulp plugins
const $ = gulpLoadPlugins();

gulp.task("default", ()=>{
  runSequence(
    ["build:dev"]
  )
});

gulp.task("dev", ()=>{
  runSequence(
    "build:dev",
    "watch"
  )
});

gulp.task("build:dev", ()=>{
  runSequence(
    'clean:dev',
    'copy:dev',
    'build:ts:dev',
    'install:dev',
    'concat:lib',
    'start:dev'
  );
});

gulp.task("client:dev", ()=>{
  runSequence(
    'clean:client:dev',
    'install:client:dev',
    'copy:client:dev',
    'build:ts:dev',
    'concat:lib'
  );
});

gulp.task("server:dev", ()=>{
  runSequence(
    'clean:server:dev',
    'copy:server:dev',
    'install:serverDist:dev',
    'start:dev'
  );
});

gulp.task("watch", ()=>{
  //TODO. when file changes, just run the necessary tasks
  gulp.watch(['**', '**/*'], {cwd: CONFIG.client}, ['client:dev']);

  gulp.watch(['**', '**/*'], {cwd: CONFIG.server}, ['start:dev']);

});

gulp.task("clean:dev", ['clean:client:dev', 'clean:server:dev'],()=>{
});

gulp.task("clean:client:dev", ()=>{
  del.sync(["public/**/*"], {cwd: CONFIG.dist});
});

gulp.task("clean:server:dev", ()=>{
  del.sync(["server/**/*", "!server/node_modules/**"], {cwd: CONFIG.dist});
});


//[Optional]
gulp.task("tslint", ()=>{

});

// Copy files
//gulp.task("copy:dev", ["copy:client:dev", "copy:server:dev"], ()=>{
gulp.task("copy:dev", ["copy:client:dev", "copy:server:dev"], ()=>{

});

gulp.task("copy:client:dev", ()=>{
  return gulp.src(['**/*', "!**/*.ts", "!**/*.js", "!**/*.js.map", "!**/node_modules/**"], {cwd: CONFIG.client})
    .pipe(gulp.dest(CONFIG.public))
});

gulp.task("copy:server:dev", ()=>{
  return gulp.src(["**/*", "package.json", "!**/node_modules/**"], {cwd: CONFIG.server})
    .pipe(gulp.dest(CONFIG.serverDist))
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
  return gulp.src(CONFIG.clientLibs, {cwd: path.join(CONFIG.client, "node_modules")})
    .pipe($.concat("lib.js"))
    .pipe(gulp.dest(path.join(CONFIG.public, "js")))
});

gulp.task("uglify:lib", ()=>{
  return gulp.src(path.join(CONFIG.public, "js", "lib.js"))
    .pipe($.uglify())
    .pipe(gulp.dest(path.join(CONFIG.public, "js")));
});

gulp.task("build:index:dev", ()=>{

});

gulp.task("install:dev", ['install:client:dev', 'install:serverDist:dev'], ()=>{
});

gulp.task("install:client:dev", ()=>{
  cp.execSync("npm install", {cwd: CONFIG.client});
});

gulp.task("install:serverDist:dev", ()=>{
  cp.execSync("npm install", {cwd: CONFIG.serverDist});
});

gulp.task("start:dev", ()=>{

  // if server already start, first kill server, then restart server
  if (server) server.kill();
  server = cp.spawn('npm', ['run', 'start-server'], {cwd: CONFIG.serverDist, stdio: 'inherit'})
  server.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });

  // if db didn't start, then start db.
  if(!db){
    db = cp.spawn("npm", ["run", "start-db"], {cwd: CONFIG.serverDist, stdio: 'inherit'});
  }

});
