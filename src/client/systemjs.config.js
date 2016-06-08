/*
 * This config is only used during development and build phase only
 * It will not be available on production
 *
 */

(function (global) {
  // ENV
  var isDevEnv = typeof global.DEV != 'undefined' && global.DEV;

  // wildcard paths
  var paths = {
    'n:*': 'src/client/node_modules/*'
  };

  // map tells the System loader where to look for things
  var map = {
    'main': 'dist/public',
    'rxjs': 'n:rxjs',
    'ng2-bs3-modal': 'n:ng2-bs3-modal',
    'reflect-metadata': 'n:reflect-metadata',
    '@angular': 'n:@angular'
  };

  // packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    'main': {
      main: 'main',
      defaultExtension: 'js'
    },
    'rxjs': {
      //main: isDevEnv ? 'Rx.umd.js' : 'undefined',
      defaultExtension: 'js'
    },
    'ng2-bs3-modal': {
      defaultExtension: 'js'
    },
    'reflect-metadata': {
      defaultExtension: 'js'
    }
  };

  var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
    'router-deprecated'
  ];

  ngPackageNames.forEach(function (pkgName) {
    packages['@angular/' + pkgName] = {
      main: isDevEnv ? pkgName + '.umd.js' : 'index.js',
      defaultExtension: 'js'
    };
  });

  var config = {
    defaultJSExtensions: false,
    map: map,
    packages: packages,
    paths: paths
  };

  if (isDevEnv) {
    config.paths = {
      'main': '/main'
    };
    config.defaultJSExtensions = 'js';
    delete config.packages.main;

    config.map = {
      '@angular': 'js/node_modules/@angular'
    };

    for (var pkgName in config.packages) {
      config.packages[pkgName].defaultExtension = false;
    }

  }

  // filterSystemConfig - index.html's chance to modify config before we register it.
  if (global.filterSystemConfig) {
    global.filterSystemConfig(config);
  }

  System.config(config);

})(this);
