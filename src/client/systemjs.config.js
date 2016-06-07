/*
 * This config is only used during development and build phase only
 * It will not be available on production
 *
 */

(function (global) {
  var config = {
    "defaultJSExtensions": true,
    "packageConfigPaths": [],
    "paths": {
      "main": "/main"
    },
    "packages": {
      "angular2": {
        "defaultExtension": false
      },
      "rxjs": {
        "defaultExtension": false
      },
      "ng2-bs3-modal": {
        "defaultExtension": false
      }
    }
  };

  if (typeof DEV != 'undefined' && !DEV) {
    delete config.paths;
    config.defaultJSExtensions = false;
    config.packages.main = {
      "format": "register"
    };
  }

  // filterSystemConfig - index.html's chance to modify config before we register it.
  if (global.filterSystemConfig) {
    global.filterSystemConfig(config);
  }

  System.config(config);

})(this);
