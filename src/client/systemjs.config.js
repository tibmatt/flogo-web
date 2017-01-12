/*
 * This config is only used during development phase only
 * It will not be available on production
 *
 */

// We define the configuration for development environment and we adjust it for the building phase
(function (global) {

  // packages tells the System loader how to load when no filename and/or no extension
  // REMEMBER to also add your add library to be loaded in map config in production section below
  var packages = {
    'ng2-bs3-modal': {
      defaultExtension: false
    },
    '@angular/common': {
      main: 'bundles/common.umd.js',
      defaultExtension: 'js'
    },
    '@angular/compiler': {
      main: 'bundles/compiler.umd.js',
      defaultExtension: 'js'
    },
    '@angular/core': {
      main: 'bundles/core.umd.js',
      defaultExtension: 'js'
    },
    '@angular/forms': {
      main: 'bundles/forms.umd.js',
      defaultExtension: 'js'
    },
    '@angular/http': {
      main: 'bundles/http.umd.js',
      defaultExtension: 'js'
    },
    '@angular/platform-browser': {
      main: 'bundles/platform-browser.umd.js',
      defaultExtension: 'js'
    },
    '@angular/platform-browser-dynamic': {
      main: 'bundles/platform-browser-dynamic.umd.js',
      defaultExtension: 'js'
    },
    '@angular/router': {
      main: 'bundles/router.umd.js',
      defaultExtension: 'js'
    }

  };

  var paths = {
    'main': '/main',
    'n:*': '/node_modules/*',
    "ng2-translate/ng2-translate": "/node_modules/ng2-translate/bundles/index.js"
  };

  // map tells the System loader where to look for things
  // load angular from node_modules folder
  var map = {
    '@angular': 'n:@angular'
  };

  var config = {
    defaultJSExtensions: 'js',
    map: map,
    packages: packages,
    paths: paths
  };

  // filterSystemConfig - index.html's chance to modify config before we register it.
  if (global.filterSystemConfig) {
    global.filterSystemConfig(config);
  }

  System.config(config);

})(this);
