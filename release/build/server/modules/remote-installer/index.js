'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteInstaller = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('../../common/constants');

var _appConfig = require('../../config/app-config');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _baseRegistered = require('../../modules/base-registered');

var _utils = require('../../common/utils');

var _githubRepoDownloader = require('../github-repo-downloader');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO
// update this information. the `somefile.json` and `aFloder` are only for testing.
// should use the imported ones from constants.
// const SCHEMA_FILE_NAME_TRIGGER = 'somefile.json';
// const SCHEMA_FILE_NAME_ACTIVITY = 'somefile.json';
// const DEFAULT_SCHEMA_ROOT_FOLDER_NAME = 'aFolder';

/**
 * Remote Installer class
 * Install activities and triggers from remote URL, currently only supports GitHub
 */

var RemoteInstaller = exports.RemoteInstaller = function () {
  function RemoteInstaller(opts) {
    _classCallCheck(this, RemoteInstaller);

    var defaultOpts = {
      type: _constants.TYPE_UNKNOWN,
      gitRepoCachePath: _appConfig.config.app.gitRepoCachePath, // location to cache the git repos.
      registerPath: _path2.default.join(_appConfig.config.rootPath, 'packages/defaults'), // location to install the node packages. Will run `npm insatll` under it.
      schemaRootFolderName: _constants.DEFAULT_SCHEMA_ROOT_FOLDER_NAME
    };

    this.opts = _lodash2.default.assign({}, defaultOpts, opts);
  }

  _createClass(RemoteInstaller, [{
    key: 'install',
    value: function install(sourceURLs) {
      var _this = this;

      return new Promise(function (resolve, reject) {

        // parse the URL
        //  1. from GitHub
        //  2. from generic web server
        var parsedURLs = _lodash2.default.reduce(sourceURLs, function (result, url, idx) {
          if ((0, _utils.isGitHubURL)(url)) {
            result.github.push(url);
          } else {
            result.default.push(url);
          }

          return result;
        }, { github: [], default: [] });

        var result = {
          github: null,
          default: null
        };

        _this.installFromGitHub(parsedURLs.github).then(function (githubResult) {
          result.github = githubResult;

          return _this.defaultInstall(parsedURLs.default);
        }).then(function (defaultResult) {
          result.default = defaultResult;

          return result;
        }).then(function (result) {

          // TODO
          //  need to merge and include the installed success ones and failed ones.

          return {
            success: _lodash2.default.union(result.github.success, result.default.success),
            fail: _lodash2.default.union(result.github.fail, result.default.fail),
            details: _lodash2.default.assign({}, result.github.details, result.default.details)
          };
        }).then(resolve).catch(function (err) {
          console.error(err);
          reject(err);
        });
      });
    }
  }, {
    key: 'installFromGitHub',
    value: function installFromGitHub(sourceURLs) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        console.log('[log] Install from GitHub');
        console.log(sourceURLs);

        var installPromise = null;
        var opts = _lodash2.default.assign({ sourceURLs: sourceURLs }, _this2.opts);

        switch (opts.type) {
          case _constants.TYPE_ACTIVITY:
            installPromise = installActivityFromGitHub(opts);
            break;
          case _constants.TYPE_TRIGGER:
            installPromise = installTriggerFromGitHub(opts);
            break;
          default:
            throw new Error('Unknown Type');
            break;
        }

        return installPromise.then(function (result) {
          console.log('[log] Installed');
          return result;
        }).then(resolve).catch(reject);
      });
    }

    // TODO

  }, {
    key: 'defaultInstall',
    value: function defaultInstall(sourceURLs) {
      return new Promise(function (resolve, reject) {
        console.log('[TODO] Default installation');

        resolve(_lodash2.default.reduce(sourceURLs, function (installResult, url) {
          console.warn('[TODO defaultInstall] Try to install [' + url + ']..');
          installResult.fail.push(url);
          return installResult;
        }, {
          success: [],
          fail: []
        }));
      });
    }
  }]);

  return RemoteInstaller;
}();

// ------- ------- -------
// utility functions

// install item from GitHub


function installFromGitHub(opts) {

  // const opts = {
  //   sourceURLs, schemaFileName, dbService, type
  // };

  var repoDownloader = new _githubRepoDownloader.GitHubRepoDownloader({
    type: opts.type,
    cacheFolder: opts.gitRepoCachePath
  });

  return repoDownloader.download(_lodash2.default.map(opts.sourceURLs, function (sourceURL) {
    return (0, _utils.constructGitHubRepoURL)((0, _utils.parseGitHubURL)(sourceURL));
  })).then(function (result) {

    // console.log( `[TODO] download result: ` );
    // _.each( result, ( item )=> {
    //   let repoPath = path.join( repoDownloader.cacheTarget,
    //     GitHubRepoDownloader.getTargetPath( item.repo ) );
    //   console.log(
    //     `---> url: ${item.repo}\n${item.result || item.error}\n${repoPath}\n<---` );
    // } );

    // reduce the sourceURLs to a downloadResult
    // create raw data for further processing.
    return _lodash2.default.reduce(opts.sourceURLs, function (dlResult, sourceURL) {

      var repoPath = '';
      var githubInfo = (0, _utils.parseGitHubURL)(sourceURL);
      var item = {
        path: (0, _utils.constructGitHubPath)(githubInfo),
        sourceURL: sourceURL,
        package: '', // package.json, to be added later
        schema: '', // schema.json, activity.json or trigger.json, to be added later
        downloaded: false,
        installed: false,
        savedToDB: false
      };

      // check if the given sourceURL belongs to a successfully downloaded repo
      var isAvailable = _lodash2.default.some(result, function (item) {
        if ((0, _utils.isInGitHubRepo)(item.repo, sourceURL) && !item.error) {
          repoPath = _path2.default.join(repoDownloader.cacheTarget, _githubRepoDownloader.GitHubRepoDownloader.getTargetPath(item.repo));

          return true;
        }

        return false;
      });

      // get package.json && schema.json
      if (isAvailable && repoPath) {
        var extraPath = githubInfo.extraPath || '';
        var packageJSONPath = _path2.default.join(repoPath, extraPath, opts.schemaRootFolderName, 'package.json');
        var schemaJSONPath = _path2.default.join(repoPath, extraPath, opts.schemaRootFolderName, opts.schemaFileName);

        try {
          // console.error( `[log] reading ${packageJSONPath}` );
          item.package = (0, _utils.readJSONFileSync)(packageJSONPath);
        } catch (e) {
          console.error('[error] reading ' + packageJSONPath + ': ');
          console.error(e);
        }

        try {
          // console.error( `[log] reading ${schemaJSONPath}` );
          item.schema = (0, _utils.readJSONFileSync)(schemaJSONPath);

          // at this step, should be save to mark the item has been downloaded.
          item.downloaded = true;
        } catch (e) {
          console.error('[error] reading ' + schemaJSONPath + ': ');
          console.error(e);
        }
      }

      dlResult.push(item);

      return dlResult;
    }, []);
  })

  // process raw items
  .then(function (rawItems) {
    return _lodash2.default.map(rawItems, function (rawItem) {
      return {
        raw: rawItem,
        dbItem: processItemFromGitHub(rawItem)
      };
    });
  })

  // install the given items using `npm` commands to the registered modules folder
  .then(function (items) {
    return sequentiallyInstall(items, {
      registerPath: opts.registerPath,
      // repo root folder including git repo cache root + type folder
      repoRoot: _path2.default.join(opts.gitRepoCachePath, opts.type.toLocaleLowerCase()),
      schemaRootFolderName: opts.schemaRootFolderName
    });
  })

  // update installation results in items.
  .then(function (installedResult) {

    return _lodash2.default.map(installedResult.items, function (item, idx) {
      item.raw.installed = installedResult.results[idx];
      return item;
    });
  })

  // save items to db
  .then(function (items) {

    // construct items for saving
    //    1. filter null items
    //    2. create a map
    var itemsToSave = _lodash2.default.reduce(items, function (itemDict, item) {

      // only save the item has dbItem configuration and installed into the server's activity/trigger repo
      if (!_lodash2.default.isNil(item.dbItem) && item.raw.installed) {
        itemDict[item.dbItem['_id']] = item.dbItem;
        item.raw.savedToDB = true;
      }

      return itemDict;
    }, {});

    return _baseRegistered.BaseRegistered.saveItems(opts.dbService, itemsToSave, true).then(function (result) {
      return {
        saveResult: result,
        items: items
      };
    });
  })

  // finally return ture once finished.
  .then(function (result) {
    return _lodash2.default.reduce(result.items, function (installResult, item) {

      if (item.raw.savedToDB && result.saveResult === true) {
        installResult.success.push(item.raw.sourceURL);
      } else {
        installResult.fail.push(item.raw.sourceURL);
      }

      installResult.details[item.raw.sourceURL] = item.raw;
      return installResult;
    }, {
      success: [],
      fail: [],
      details: {}
    });
  }).catch(function (err) {
    console.log('[error] error on installFromGitHub');
    throw err;
  });
}

// shorthand function to install triggers from GitHub
function installTriggerFromGitHub(opts) {

  return installFromGitHub(_lodash2.default.assign({
    schemaFileName: _constants.SCHEMA_FILE_NAME_TRIGGER,
    dbService: _appConfig.triggersDBService,
    type: _constants.TYPE_TRIGGER
  }, opts));
}

// shorthand function to install activities from GitHub
function installActivityFromGitHub(opts) {

  return installFromGitHub(_lodash2.default.assign({
    schemaFileName: _constants.SCHEMA_FILE_NAME_ACTIVITY,
    dbService: _appConfig.activitiesDBService,
    type: _constants.TYPE_ACTIVITY
  }, opts));
}

function processItemFromGitHub(rawItemInfo) {
  var itemInfo = null;

  if (rawItemInfo.path && rawItemInfo.package && rawItemInfo.schema) {
    var p = rawItemInfo.package;
    var s = rawItemInfo.schema;

    // merge the schema and package information together
    // so that the name/version/description information can be overridden.
    var m = _lodash2.default.assign({}, p, s);

    itemInfo = _baseRegistered.BaseRegistered.constructItem({
      'id': _baseRegistered.BaseRegistered.generateID(m.name, m.version),
      'where': rawItemInfo.path,
      'name': m.name,
      'version': m.version,
      'description': m.description,
      'keywords': m.keywords || [],
      'author': m.author,
      'schema': s
    });
  }

  return itemInfo;
}
/**
 * Install the items sequentially using `npm install` command,
 *
 * Will resolve with the items passed into it, after job done.
 * {
 *  items: items,
 *  result: installationResult
 * }
 *
 * @param items
 * @param opts
 * @returns {Promise}
 */
function sequentiallyInstall(items, opts) {

  return new Promise(function (resolve, reject) {

    var processedItemNum = 0;
    var installedResult = [];

    function _sequentiallyInstall() {

      var item = items[processedItemNum];

      if (_lodash2.default.isNil(item)) {
        throw new Error('[error] cannot install item ' + processedItemNum + ' of ' + items);
      }

      var githubInfo = (0, _utils.parseGitHubURL)(item.raw.sourceURL);
      var packagePath = _path2.default.join(opts.repoRoot, githubInfo.username, githubInfo.repoName, githubInfo.extraPath, opts.schemaRootFolderName);

      processedItemNum++;

      var promise = null;

      // if the repo is available, run `npm install` command for it.
      if (item.raw.downloaded) {
        promise = (0, _utils.runShellCMD)('npm', ['i', '-S', packagePath], { cwd: opts.registerPath });
      } else {
        promise = Promise.resolve(false);
      }

      return promise.then(function (result) {
        if (result !== false && !_lodash2.default.isNil(result)) {
          installedResult.push(true);
        } else {
          installedResult.push(false);
        }

        if (processedItemNum >= items.length) {
          resolve({
            items: items,
            results: installedResult
          });
        } else {
          return _sequentiallyInstall();
        }
      });
    }

    _sequentiallyInstall().catch(function (err) {
      console.log('[TODO] sequentiallyInstall on error: ');
      console.error(err);
      reject(err);
    });
  });
}