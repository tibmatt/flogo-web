// Turn on full stack traces in errors to help debugging
Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

/**
 * Cancel Karma's synchronous start, we will call `__karma__.start()` later, once all the specs are loaded.
 */
__karma__.loaded = function () {
};

function isJsFile(path) {
  return path.slice(-3) == '.js';
}

function isSpecFile(path) {
  return path.slice(-8) == '.spec.js';
}

function isBuiltFile(path) {
  var builtPath = '/base/app';
  let is = isJsFile(path) && (path.substr(0, builtPath.length) == builtPath);
  console.log(path+ '-' + is);
  return is;
}

var allSpecFiles = Object.keys(window.__karma__.files)
  .filter(isSpecFile)
  .filter(isBuiltFile);


System.config({
  baseURL: '/base/'
});

System.config({

  map: {
    /*'test': 'test',*/
    'rxjs': 'node_modules/rxjs',
    '@angular': 'node_modules/@angular',
    'app': 'app'
  },
  packages: {
    /*
    'test': {
      main: 'main.js',
      defaultExtension: 'js'
    },*/
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

  // a bug with karma-coverage and system.js
  meta: {
    'app/*': {
      format: 'register'
    }
  }

});

Promise.all([
 System.import('@angular/core/testing'),
 System.import('@angular/platform-browser-dynamic/testing')
])
  .then(function (providers) {
    var testing = providers[0];
    var testingBrowser = providers[1];

    testing.setBaseTestProviders(testingBrowser.TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
      testingBrowser.TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS);
  })
  .then(function () {
    // Finally, load all spec files.
    // This will run the tests directly.
    return Promise.all(
      allSpecFiles.map(function (moduleName) {
        return System.import(moduleName);
      }));
  }).then(__karma__.start, __karma__.error);

/*
.then(function () {
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
*/