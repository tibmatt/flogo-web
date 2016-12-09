'use strict';

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    // files needed by angular js plus application and test files
    files: [
      //Polyfills
      'node_modules/es6-shim/es6-shim.js',
      'node_modules/reflect-metadata/Reflect.js',
      // System.js
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',
      // zone.js dependencies
                  //'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/jasmine-patch.js',
      'node_modules/zone.js/dist/async-test.js',
      'node_modules/zone.js/dist/fake-async-test.js',
      // rxjs dependencies
      {pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false /*, served: true*/},
      {pattern: 'node_modules/rxjs/**/*.js.map', included: false, watched: false /*, served: true*/},
      // helper
      {pattern:'karma.helper.js', included: true, watched: true},
      // angular dependencies
      {pattern: 'node_modules/@angular/**/*.js', included: false, watched: false},
      {pattern: 'node_modules/@angular/**/*.js.map', included: false, watched: false},
      // our application
      {pattern: 'main.js', included: false, watched: true},
      {pattern: 'app/**/*.js', included: false, watched: true},
                 //{pattern: 'app/**/*.js.map', included: false, watched: false},
      // paths loaded via Angular's component compiler
      // (these paths need to be rewritten, see proxies section)
      {pattern: 'app/**/*.html', included: false, watched: true},
      {pattern: 'app/**/*.css', included: false, watched: true}
    ],
    // exclude angular 2 test files
    exclude: [
      'node_modules/@angular/**/*_spec.js'
    ],
    // proxied base paths
    /*proxies: {
      // required for component assests fetched by Angular's compiler
      "/app/": "/base/app/"
    },*/
    // enable coverage module
    reporters: ['spec'],
    port: 9876,
    colors: true,
    autoWatch: false,
    // use Chrome to launch the tests
    browsers: [
      'Chrome'
    ],
    logLevel: config.LOG_INFO,
    singleRun: false
  });
};