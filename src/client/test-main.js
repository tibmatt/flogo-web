// Turn on full stack traces in errors to help debugging
Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

/**
 * Cancel Karma's synchronous start, we will call `__karma__.start()` later, once all the specs are loaded.
 */
__karma__.loaded = function () {
};

System.config({
  baseURL: '/base/'
});

//bagin change
//baseURL: '/base/',
System.config({

  map: {
    'rxjs': 'node_modules/rxjs',
    '@angular': 'node_modules/@angular',
    'app': 'dist'
  },
  packages: {
    'app': {
      main: 'main.js',
      defaultExtension: 'js'
    },
    '@angular/core': {
      main: 'index.js',
      defaultExtension: 'js'
    },
    '@angular/compiler': {
      main: 'index.js',
      defaultExtension: 'js'
    },
    '@angular/common': {
      main: 'index.js',
      defaultExtension: 'js'
    },
    '@angular/platform-browser': {
      main: 'index.js',
      defaultExtension: 'js'
    },
    '@angular/platform-browser-dynamic': {
      main: 'index.js',
      defaultExtension: 'js'
    },
    'components/*': {
      format: 'register',
      defaultExtension: 'js'
    },
    'directives': {
      format: 'register',
      defaultExtension: 'js'
    },
    'core': {
      format: 'register',
      defaultExtension: 'js'
    },
    // '@angular/router-deprecated': {
    //   main: 'index.js',
    //   defaultExtension: 'js'
    // },
    '@angular/router': {
      main: 'index.js',
      defaultExtension: 'js'
    },
    'rxjs': {
      defaultExtension: 'js'
    }
  },

  /*
  baseURL: '/base/',
  defaultJSExtensions: true,
  paths: {
    'npm:': 'node_modules/',
    //'angular2/*': 'node_modules/@angular/*.js',
    'rxjs/*': 'node_modules/rxjs/*.js'
  },
  map: {
    '@angular/core': 'npm:@angular/core/core.umd.js',
    '@angular/common': 'npm:@angular/common/common.umd.js',
    '@angular/compiler': 'npm:@angular/compiler/compiler.umd.js',
    '@angular/platform-browser': 'npm:@angular/platform-browser/platform-browser.umd.js',
    '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/platform-browser-dynamic.umd.js',
    // angular testing umd bundles
    '@angular/core/testing': 'npm:@angular/core/bundles/core-testing.umd.js',
    '@angular/common/testing': 'npm:@angular/common/bundles/common-testing.umd.js',
    '@angular/compiler/testing': 'npm:@angular/compiler/bundles/compiler-testing.umd.js',
    '@angular/platform-browser/testing': 'npm:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
    '@angular/platform-browser-dynamic/testing': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
  },
  */
  // a bug with karma-coverage and system.js
  meta: {
    'app/*': {
      format: 'register'
    }
  }

});

//System.import('angular2/src/platform/browser/browser_adapter'),
Promise.all([
  System.import('@angular/core/testing'),
  System.import('@angular/platform-browser-dynamic/testing')
  /*System.import('angular2/platform-browser-dynamic/testing')*/
]).then(function (modules) {
  var browser_adapter = modules[0];
  var providers = modules[1];
  var testing = modules[2];
  testing.setBaseTestProviders(providers.TEST_BROWSER_PLATFORM_PROVIDERS,
    providers.TEST_BROWSER_APPLICATION_PROVIDERS);

  browser_adapter.BrowserDomAdapter.makeCurrent();
}).then(function () {
    return Promise.all(
      Object.keys(window.__karma__.files) // All files served by Karma.
        .filter(onlySpecFiles)
        .map(file2moduleName)
        .map(function (path) {
          return System.import(path).then(function (module) {
            if (module.hasOwnProperty('main')) {
              module.main();
            } else {
              throw new Error('Module ' + path + ' does not implement main() method.');
            }
          });
        }));
  })
  .then(function () {
    __karma__.start();
  }, function (error) {
    console.error(error.stack || error);
    __karma__.start();
  });

// filter test files
function onlySpecFiles(path) {
  return /spec\.js$/.test(path);
}

// Normalize paths to module names.
function file2moduleName(filePath) {
  return filePath.replace(/\\/g, '/')
    .replace(/.*\/modules\//, '')
    .replace(/.*\/dist\/js\/dev\/es5\//, '')
    .replace(/\/web\//, '/')
    .replace(/\/lib\//, '/')
    .replace(/\.\w*$/, '');
}