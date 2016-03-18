var gulp = require('gulp'),
    rename = require('gulp-rename'),
    path= require('path'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject-string'),
    less = require('gulp-less'),
    traceur = require('gulp-traceur'),
    babel = require('gulp-babel'),
    runSequence = require('run-sequence');

const DEFAULT_TRANSPILER = 'babel'; //options (traceur or babel) default babel

function defaultTranspilerTask() {
  return  DEFAULT_TRANSPILER === 'traceur' ? 'js-traceur' : 'js-babel';
}

// run init tasks
gulp.task('default', (cb) => {
  var tasks = ['jsDependencies','cssDependencies','copyFonts', defaultTranspilerTask(), 'html', 'less', cb];

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
gulp.task('jsDependencies', () => {

  var libraries = [
    'node_modules/systemjs/dist/system-csp-production.src.js',
    'node_modules/systemjs/dist/system.js',
    'node_modules/reflect-metadata/Reflect.js',
    'node_modules/angular2/bundles/angular2.js',
    'node_modules/angular2/bundles/router.dev.js',
    'node_modules/angular2/bundles/http.dev.js',
    'node_modules/angular2/bundles/angular2-polyfills.js',
    'node_modules/traceur/bin/traceur-runtime.js',
    'node_modules/rxjs/bundles/Rx.js',
    'node_modules/es6-shim/es6-shim.min.js',
    'node_modules/es6-shim/es6-shim.map',
    'node_modules/github-api/dist/github.bundle.min.js',
    'node_modules/github-api/dist/github.bundle.min.js.map',
    'node_modules/moment/min/moment.min.js'
  ];

  return gulp.src(libraries)
    .pipe(gulp.dest('build-app/lib'));
});

// move dependencies into build dir
gulp.task('cssDependencies', () => {

  var libraries = [
    'node_modules/bootstrap/dist/css/bootstrap.css',
    'node_modules/font-awesome/css/font-awesome.css',
    'node_modules/bootstrap-social/bootstrap-social.css'
  ];

  return gulp.src(libraries)
    .pipe(gulp.dest('build-app/styles/vendor'));
});

// move dependencies into build dir
gulp.task('copyFonts', () => {

  return gulp.src(['node_modules/font-awesome/fonts/*.*','node_modules/bootstrap/fonts/*.*'])
    .pipe(gulp.dest('build-app/styles/fonts'));
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
  console.log('running html');
  return gulp.src('dev/app/**/*.html')
    .pipe(gulp.dest('build-app'))
});


gulp.task('less', () => {
  return gulp.src('dev/app/**/*.less')
    .pipe(less())
    .pipe(concat('app.css'))
    .pipe(gulp.dest('build-app/styles'));
});
