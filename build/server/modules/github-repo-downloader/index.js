'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GitHubRepoDownloader = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('../../common/constants');

var _appConfig = require('../../config/app-config');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utils = require('../../common/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Download GitHub repo to local environment.
 *
 * Configurations:
 *    1. A cache folder to save the GitHub repositories.
 *        In such way, the installer can install the package.json from
 *        its subdirectories using npm command.
 *
 * Folder structures:
 *
 *  cache
 *  |-- activity
 *      |-- some activity
 *  |-- trigger
 *      |-- some trigger
 *
 * Operational logic
 *  1. Trigger download API with a given URL list
 *  2. Verify if the repo(s) exists
 *    2.1. If exists, update the repo in cache folder
 *    2.2. If doesn't exist, checkout the given repo in cache folder
 *  3. After finishing, return a success list and a fail list.
 */

var GitHubRepoDownloader = exports.GitHubRepoDownloader = function () {
  function GitHubRepoDownloader(opts) {
    _classCallCheck(this, GitHubRepoDownloader);

    var defaultOpts = {
      cacheFolder: _appConfig.config.app.gitRepoCachePath,
      type: _constants.TYPE_UNKNOWN
    };

    this.opts = _lodash2.default.assign({}, defaultOpts, opts);
  }

  /**
   * Get the relative path of a given repo that should be used to cache the repo
   *
   * @param repoURL
   */


  _createClass(GitHubRepoDownloader, [{
    key: 'updateType',
    value: function updateType(newType) {
      this.opts.type = newType;
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      return (0, _utils.rmFolder)(this.cacheTarget);
    }
  }, {
    key: 'download',
    value: function download(urls) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        // deduplication
        var repos = _lodash2.default.uniq(urls);

        var taskPromises = _lodash2.default.map(repos, function (repo) {
          var targetPath = GitHubRepoDownloader.getTargetPath(repo);
          var absoluteTargetPath = _path2.default.join(_this.cacheTarget, targetPath);

          console.log('[log] caching repo \'' + repo + '\' to \'' + absoluteTargetPath + '\'');

          return hasRepoCached(repo, _this.cacheTarget).then(function (result) {
            if (result === false) {

              return newRepoHandler(repo, absoluteTargetPath);
            } else if (result === true) {

              return existsRepoHandler(repo, absoluteTargetPath);
            } else {
              // invalid result.
              throw result;
            }
          }).then(function (result) {
            return {
              repo: repo,
              result: result
            };
          }).catch(function (err) {
            console.error(err);
            return {
              repo: repo,
              error: err
            };
          });
        });

        Promise.all(taskPromises).then(function (result) {
          console.log('[info] download repos results: ');
          console.log(result);
          resolve(result);
        }).catch(function (err) {
          console.log('[error] fail to download repos');
          reject(err);
        });
      });
    }
  }, {
    key: 'cacheTarget',
    get: function get() {
      return _path2.default.join(this.opts.cacheFolder, this.opts.type.toLowerCase());
    }
  }], [{
    key: 'getTargetPath',
    value: function getTargetPath(repoURL) {
      var parsedURL = (0, _utils.parseGitHubURL)(repoURL);
      return _path2.default.join(parsedURL.username, parsedURL.repoName);
    }
  }]);

  return GitHubRepoDownloader;
}();

/**
 * check if the given repo exists in the cache folder.
 *
 * @param repoURL
 * @param cacheFolder
 * @returns {Promise}
 */


function hasRepoCached(repoURL, cacheFolder) {
  return new Promise(function (resolve, reject) {
    _fs2.default.stat(_path2.default.join(cacheFolder, GitHubRepoDownloader.getTargetPath(repoURL), '.git'), function (err, stats) {
      if (err) {
        // log the error if it's not the `no entity` error.
        if (err.code !== 'ENOENT') {
          console.log('[log] GitHubRepoDownloader.hasRepoCached on error: ');
          console.log(err);
        }
        resolve(false);
      } else if (stats.isDirectory()) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// download new repo
//    create folder
//    clone the repo
function newRepoHandler(repoURL, folderPath) {
  return new Promise(function (resolve, reject) {
    (0, _utils.createFolder)(folderPath).then(function (result) {
      return (0, _utils.gitClone)(repoURL, folderPath);
    }).then(function (result) {
      console.log('[log] new repo: ' + repoURL + ' ---> ' + folderPath);
      console.log(result);
      resolve(true);
      return result;
    }).catch(function (err) {
      console.error('[error] error on newRepoHandler');
      reject(err);
    });
  });
}

// update the repo
function existsRepoHandler(repoURL, folderPath) {
  return new Promise(function (resolve, reject) {
    (0, _utils.gitUpdate)(folderPath).then(function () {
      resolve(true);
    }).catch(function (err) {
      console.error('[error] error on existsRepoHandler');
      reject(err);
    });
  });
}