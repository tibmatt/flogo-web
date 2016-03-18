var gulp = require('gulp'),
    rename = require('gulp-rename'),
    path= require('path'),
    concat = require('gulp-concat'),
    manifest = require('gulp-appcache'),
    inject = require('gulp-inject-string'),
    less = require('gulp-less'),
    traceur = require('gulp-traceur'),
    babel = require('gulp-babel'),
    runSequence = require('run-sequence');

const DEFAULT_TRANSPILER = 'babel'; //options (traceur or babel) default babel

function defaultTranspilerTask() {
  return  DEFAULT_TRANSPILER === 'traceur' ? 'js-traceur' : 'js-babel';
}

gulp.task('cssDependencies', () => {

  var libraries = [
    'node_modules/bootstrap/dist/css/bootstrap.css',
  ];

  return gulp.src(libraries)
    .pipe(gulp.dest('build-app/styles/vendor'));
});

// run init tasks
gulp.task('default', (cb) => {
  var tasks = ['dependencies', 'cssDependencies',defaultTranspilerTask(), 'html', 'less', 'manifest', cb];

  return runSequence.apply(this, tasks);
});

// run development task
gulp.task('dev', (cb) => {
  runSequence('default', 'watch',  cb);
});


// watch for changes and run the relevant task
gulp.task('watch', () => {
  gulp.watch('dev/**/*.js', [defaultTranspilerTask()]);
  gulp.watch('dev/**/*.html', ['html']);
  gulp.watch('dev/**/*.less', ['less']);
});

// move dependencies into build dir
gulp.task('dependencies', () => {

  var libraries = [
    'node_modules/systemjs/dist/system-csp-production.src.js',
    'node_modules/systemjs/dist/system.js',
    'node_modules/reflect-metadata/Reflect.js',
    'node_modules/angular2/bundles/angular2.js',
    'node_modules/angular2/bundles/http.dev.js',
    'node_modules/angular2/bundles/angular2-polyfills.js',
    'node_modules/traceur/bin/traceur-runtime.js',
    'node_modules/rxjs/bundles/Rx.js',
    'node_modules/es6-shim/es6-shim.min.js',
    'node_modules/es6-shim/es6-shim.map',
    'node_modules/redux/dist/redux.js',
    'node_modules/node-uuid/uuid.js',
    'node_modules/localforage/dist/localforage.js'
  ];

  return gulp.src(libraries)
    .pipe(gulp.dest('build-app/lib'));
});

// transpile with traceur & move js
gulp.task('js-traceur', () => {
  return gulp.src('dev/app/**/*.js')
    .pipe(traceur({
      modules: 'instantiate',
      moduleName: false,
      annotations: true,
      types: true,
      memberVariables: true
    }))
    .pipe(rename({
      extname: '.js'
    }))
    .pipe(gulp.dest('build-app'));
});

// transpile with babel & move js
gulp.task('js-babel', () => {
  return gulp.src('dev/app/**/*.js')
    .pipe(babel())
    .pipe(rename({
      extname: '.js'
    }))
    .pipe(gulp.dest('build-app'));
});

// move html
gulp.task('html', () => {
  return gulp.src('dev/app/**/*.html')
    .pipe(gulp.dest('build-app'))
});


gulp.task('less', () => {
  return gulp.src('dev/app/**/*.less')
    .pipe(less())
    .pipe(concat('app.css'))
    .pipe(gulp.dest('build-app/styles'));
});

gulp.task('manifest', function(){
  gulp.src(['build-app/**/*'])
    .pipe(manifest({
      relativePath: '',
      hash: true,
      preferOnline: true,
      network: ['http://*', 'https://*', '*'],
      filename: 'app.manifest',
      exclude: 'app.manifest'
    }))
    .pipe(gulp.dest('build-app'));
});
