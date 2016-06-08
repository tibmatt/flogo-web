/*
 * This config is only used during development and build phase only
 * It will not be available on production
 *
 */

(function(global) {
  // ENV
  //global.ENV = 'development'

  // wildcard paths
  var paths = {
    'n:*': 'src/client/node_modules/*'
  };

  // map tells the System loader where to look for things
  var map = {
    'main': 'dist/public',
    'rxjs': 'n:rxjs',
    'angular2': 'n:angular2',
    'ng2-bs3-modal': 'n:ng2-bs3-modal',
    'reflect-metadata': 'n:reflect-metadata'
    //'lodash': 'n:lodash'
  };

  // packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    'angular2': {
      defaultExtension: 'js'
    },
    'main': {
      main: 'main',
      defaultExtension: 'js'
    },
    'rxjs': {
      defaultExtension: 'js'
    },
    'ng2-bs3-modal': {
      defaultExtension: 'js'
    },
    'reflect-metadata': {
      defaultExtension: 'js'
    }
  };

  var config = {
    defaultJSExtensions: false,
    map: map,
    packages: packages,
    paths: paths
  };

  if (typeof DEV != 'undefined' && DEV) {
    config.paths = {
      'main': '/main'
    };
    config.defaultJSExtensions = 'js';
    delete config.packages.main;
    delete config.map;

    for(var pkgName in config.packages) {
      config.packages[pkgName].defaultExtension = false;
    }

  }

  // filterSystemConfig - index.html's chance to modify config before we register it.
  if (global.filterSystemConfig) { global.filterSystemConfig(config); }

  System.config(config);

})(this);
