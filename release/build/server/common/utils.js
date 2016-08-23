'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractDomain = extractDomain;
exports.btoa = btoa;
exports.atob = atob;
exports.isExisted = isExisted;
exports.isDirectory = isDirectory;
exports.readDirectoriesSync = readDirectoriesSync;
exports.isJSON = isJSON;
exports.readJSONFileSync = readJSONFileSync;
exports.readJSONFile = readJSONFile;
exports.findLastCreatedFile = findLastCreatedFile;
exports.writeJSONFileSync = writeJSONFileSync;
exports.writeJSONFile = writeJSONFile;
exports.flogoIDEncode = flogoIDEncode;
exports.flogoIDDecode = flogoIDDecode;
exports.flogoGenTaskID = flogoGenTaskID;
exports.flogoGenTriggerID = flogoGenTriggerID;
exports.genNodeID = genNodeID;
exports.convertTaskID = convertTaskID;
exports.isGitHubURL = isGitHubURL;
exports.parseGitHubURL = parseGitHubURL;
exports.isInGitHubRepo = isInGitHubRepo;
exports.constructGitHubFileURI = constructGitHubFileURI;
exports.constructGitHubPath = constructGitHubPath;
exports.constructGitHubRepoURL = constructGitHubRepoURL;
exports.runShellCMD = runShellCMD;
exports.createFolder = createFolder;
exports.rmFolder = rmFolder;
exports.gitClone = gitClone;
exports.gitUpdate = gitUpdate;
exports.inspectObj = inspectObj;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _performanceNow = require('performance-now');

var _performanceNow2 = _interopRequireDefault(_performanceNow);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _constants = require('../common/constants');

var _child_process = require('child_process');

var _util = require('util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extractDomain(url) {
  var domain;
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }

  domain = domain.split(':')[0];
  return domain;
}

function btoa(str) {
  var buffer;

  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = new Buffer(str.toString(), 'binary');
  }

  return buffer.toString('base64');
}

function atob(str) {
  return new Buffer(str, 'base64').toString('binary');
}

function isExisted(testedPath) {
  try {
    _fs2.default.accessSync(testedPath, _fs2.default.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function isDirectory(testedPath) {
  if (isExisted(testedPath)) {
    var stats = _fs2.default.statSync(testedPath);
    if (stats.isDirectory()) {
      return true;
    } else {
      return false;
    }
  } else {
    return undefined;
  }
}

function readDirectoriesSync(dirPath) {
  var dirs = _fs2.default.readdirSync(dirPath);
  var nDirs = [];
  dirs.forEach(function (dir) {
    if (isDirectory(_path2.default.join(dirPath, dir))) {
      nDirs.push(dir);
    }
  });

  return nDirs;
}

/**
 * judge whether a string is a valid json string. if i
 * @param  {string}  str - the JSON string
 * @return {object|undefined} if it is a valid json, return json, otherwise return undefined
 */
function isJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
}

/**
 * Read a JSON file
 * @param  {string|Path} jSONPath - the path of JSON file
 * @return {object|undefined} if it is a valid and exist json, return json, otherwise return undefined
 */
function readJSONFileSync(JSONPath) {
  var data = undefined;
  if (isExisted(JSONPath)) {
    data = _fs2.default.readFileSync(JSONPath, {
      "encoding": "utf8"
    });
    data = isJSON(data);
  } else {
    console.error("[error][utils.js->readJSONFileSync] path doesn't exist. path: ", JSONPath);
  }

  return data;
}

/**
 * Async version of readJSONFileSync
 * @param  {string|Path} jSONPath - the path of JSON file
 * @return {Promise<object|undefined>} if it is a valid and exist json, return json, otherwise return undefined
 */
function readJSONFile(JSONPath) {
  return new Promise(function (resolve, reject) {
    if (isExisted(JSONPath)) {
      _fs2.default.readFile(JSONPath, { 'encoding': 'utf8' }, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(isJSON(data));
        }
      });
    } else {
      console.error("[error][utils.js->readJSONFile] path doesn't exist. path: ", JSONPath);
      throw new Error('Path [' + JSONPath + '] doesn\'t exist.');
    }
  });
}

/**
 * Get absoulte path to latest file in a directory. It does not recurse.
 * @param where directory to look in
 * @param name {string|RegExp} name of the file
 * @returns {Promise<String>} resolves to absolute path to file or null if no file found with the provided name
 */
function findLastCreatedFile(where, name) {

  if (typeof name === 'string') {
    name = new RegExp(name);
  }

  return new Promise(function (resolve, reject) {
    _fs2.default.readdir(where, function (err, files) {
      if (err) {
        return reject(err);
      }

      var fileStatsCollect = files.filter(function (fileName) {
        return name.test(fileName);
      }).map(function (fileName) {
        return new Promise(function (resolve, reject) {
          var filePath = _path2.default.join(where, fileName);
          _fs2.default.stat(filePath, function (err, stats) {
            return resolve(err ? null : { path: filePath, creation: stats.birthtime.getTime() });
          });
        });
      });

      Promise.all(fileStatsCollect).then(function (files) {
        return files.reduce(function (greatest, current) {
          return current.creation > greatest.creation ? current : greatest;
        }, { creation: 0 });
      }).then(function (fileInfo) {
        return fileInfo.path || null;
      }).then(resolve);
    });
  });
}

/**
 * write a JSON file
 * @param {string|Path} JSONPath - the path of JSON file
 * @param {object} data - the JSON data you want to write
 * @return {boolean} if write successful, return ture, otherwise return false
 */
function writeJSONFileSync(JSONPath, data) {
  try {
    _fs2.default.writeFileSync(JSONPath, JSON.stringify(data, null, 2), {
      "encoding": "utf8"
    });
    return true;
  } catch (err) {
    console.error("[error][utils.js->writeJSONFileSync] err: ", err);
    return false;
  }
}

/**
 * Async version of writeJSONFileSync
 * @param {string|Path} JSONPath - the path of JSON file
 * @param {object} data - the JSON data you want to write
 * @return {Promise<boolean>} if write successful, return true, otherwise return false
 */
function writeJSONFile(JSONPath, data) {
  return new Promise(function (resolve, reject) {
    _fs2.default.writeFile(JSONPath, JSON.stringify(data, null, 2), { 'encoding': 'utf8' }, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

function flogoIDEncode(id) {
  return btoa(id).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// URL safe base64 decoding
// reference: https://gist.github.com/jhurliman/1250118
function flogoIDDecode(encodedId) {

  encodedId = encodedId.replace(/-/g, '+').replace(/_/g, '/');

  while (encodedId.length % 4) {
    encodedId += '=';
  }

  return atob(encodedId);
}

function flogoGenTaskID(items) {
  var taskID = void 0;

  // TODO
  //  generate a more meaningful task ID in string format
  if (items) {
    var ids = _lodash2.default.keys(items);
    var startPoint = 2; // taskID 1 is reserved for the rootTask

    var taskIDs = _lodash2.default.map(_lodash2.default.filter(ids, function (id) {
      return items[id].type === _constants.FLOGO_TASK_TYPE.TASK;
    }), function (id) {
      return _lodash2.default.toNumber(flogoIDDecode(id));
    });

    var currentMax = _lodash2.default.max(taskIDs);

    if (currentMax && _lodash2.default.isFinite(currentMax)) {
      // isFinite: _.max coerces values to number in lodash versions < 4
      taskID = '' + (currentMax + 1);
    } else {
      taskID = '' + startPoint;
    }
  } else {
    // shift the timestamp for avoiding overflow 32 bit system
    taskID = '' + (Date.now() >>> 1);
  }

  return flogoIDEncode(taskID);
}

function flogoGenTriggerID() {
  return flogoIDEncode('Flogo::Trigger::' + Date.now());
}

function genNodeID(items) {

  var id = '';

  if (_performanceNow2.default && _lodash2.default.isFunction(_performanceNow2.default)) {
    id = 'FlogoFlowDiagramNode::' + Date.now() + '::' + (0, _performanceNow2.default)();
  } else {
    id = 'FlogoFlowDiagramNode::' + Date.now() + '}';
  }

  return flogoIDEncode(id);
};

/**
 * Convert task ID to integer, which is the currently supported type in engine
 * TODO
 *  taskID should be string in the future, perhaps..
 *
 * @param taskID
 * @returns {number}
 * @private
 */
function convertTaskID(taskID) {
  var id = '';

  try {
    id = flogoIDDecode(taskID);

    // get the timestamp
    var parsedID = id.split('::');

    if (parsedID.length >= 2) {
      id = parsedID[1];
    }
  } catch (e) {
    console.warn(e);
    id = taskID;
  }

  return parseInt(id);
}

/** *******
 * GitHub related utility functions
 */

// TODO support more git format
//  for the moment
//    https://github.com/:username/:projectname.git
//    https://github.com/:username/:projectname
var GITHUB_URL_PATTERN = /^(?:https\:\/\/)?github\.com\/(?:([\w\-]+)\/)(?:([\w\-]+)(?:\.git)?)$/.source;
var GITHUB_URL_SUBFOLDER_PATTERN = /^(?:https\:\/\/)?github\.com\/(?:([\w\-]+)\/)(?:([\w\-]+))\/(?:([\w\-/]+))$/.source;

function isGitHubURL(url) {
  var simplePattern = new RegExp(GITHUB_URL_PATTERN);
  var subfolderPattern = new RegExp(GITHUB_URL_SUBFOLDER_PATTERN);
  return simplePattern.test(url) || subfolderPattern.test(url);
}

function parseGitHubURL(url) {
  var simplePattern = new RegExp(GITHUB_URL_PATTERN);
  var subfolderPattern = new RegExp(GITHUB_URL_SUBFOLDER_PATTERN);
  var result = null;

  var parsed = url.match(simplePattern);

  if (parsed) {
    result = {
      url: url,
      username: parsed[1],
      repoName: parsed[2]
    };
  } else {
    parsed = url.match(subfolderPattern);

    if (parsed) {
      result = {
        url: url,
        username: parsed[1],
        repoName: parsed[2],
        extraPath: parsed[3]
      };
    }
  }

  return result;
}

/**
 * Verify if the given url is within the given GitHub repo.
 *
 * @param repoURL
 * @param url
 */
function isInGitHubRepo(repoURL, url) {
  if (isGitHubURL(repoURL) && isGitHubURL(url)) {
    var parsedRepoURL = parseGitHubURL(repoURL);
    var parsedURL = parseGitHubURL(url);

    return parsedRepoURL.username === parsedURL.username && parsedRepoURL.repoName === parsedURL.repoName;
  } else {
    console.warn('[warn] invalid GitHub URL: ' + repoURL);
    return false;
  }
}

/**
 * Construct GitHub file URI using the download URL format.
 *
 * https://raw.githubusercontent.com/:username/:repoName/[:branchName | :commitHash]/:filename
 *
 * @param githubInfo {Object} `username`, `repoName`, `branchName`, `commitHash`
 * @param fileName {String} Name of the file.
 * @returns {string} The file URI to retrieve the raw data of the file.
 */
function constructGitHubFileURI(githubInfo, fileName) {
  var commitish = githubInfo.commitHash || githubInfo.branchName || 'master';
  var extraPath = githubInfo.extraPath ? '/' + githubInfo.extraPath : '';

  return 'https://raw.githubusercontent.com/' + githubInfo.username + '/' + githubInfo.repoName + '/' + commitish + extraPath + '/' + fileName;
}

function constructGitHubPath(githubInfo) {
  var extraPath = githubInfo.extraPath ? '/' + githubInfo.extraPath : '';
  return 'github.com/' + githubInfo.username + '/' + githubInfo.repoName + extraPath;
}

function constructGitHubRepoURL(githubInfo) {
  return 'https://github.com/' + githubInfo.username + '/' + githubInfo.repoName + '.git';
}

/** *******
 * CMD related utility functions
 */

/**
 * Port `child_process.spawn` with Promise, same inputs as the original API
 *
 * https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
 */
function runShellCMD(cmd, args, opts) {
  return new Promise(function (resolve, reject) {
    var _cmd = (0, _child_process.spawn)(cmd, args, opts);
    var _data = '';
    var errData = '';

    console.log('[info] run command: ' + cmd + ' ' + args.join(' '));

    _cmd.stdout.on('data', function (data) {
      _data += data;
    });

    _cmd.stderr.on('data', function (data) {
      errData += data instanceof Buffer ? data.toString() : data;
    });

    _cmd.on('close', function (code) {
      if (code !== 0) {
        console.log('[log] command exited with code ' + code + ': ' + cmd + ' ' + args.join(' '));
        reject(errData);
      } else {
        resolve(_data);
      }
    });
  });
}

/**
 * Create the given folder using `mkdir` command
 *
 * @param folderPath
 * @returns {Promise}
 */
function createFolder(folderPath) {
  return new Promise(function (resolve, reject) {
    runShellCMD('mkdir', ['-p', folderPath]).then(function () {
      resolve(true);
    }).catch(function (err) {
      reject(err);
    });
  });
}

/**
 * Remove the given folder using `rm -rf`
 *
 * @param folderPath
 * @returns {Promise}
 */
function rmFolder(folderPath) {
  return new Promise(function (resolve, reject) {
    runShellCMD('rm', ['-rf', folderPath]).then(function () {
      resolve(true);
    }).catch(function (err) {
      reject(err);
    });
  });
}

/**
 * Git clone a given repo with `--recursive` flag, to an absolute path
 *
 * @param repoURL
 * @param folderPath
 * @returns {Promise}
 */
function gitClone(repoURL, folderPath) {
  return new Promise(function (resolve, reject) {
    runShellCMD('git', ['clone', '--recursive', repoURL, folderPath]).then(function () {
      resolve(true);
    }).catch(function (err) {
      reject(err);
    });
  });
}

/**
 * Run `git pull --rebase` under the given absolute path.
 *
 * @param folderPath
 * @returns {Promise}
 */
function gitUpdate(folderPath) {
  return new Promise(function (resolve, reject) {
    runShellCMD('git', ['pull', '--rebase'], { cwd: folderPath }).then(function () {
      resolve(true);
    }).catch(function (err) {
      reject(err);
    });
  });
}

/** *******
 * Logging related utilities
 */

/**
 * Inspect object using `util.inspect` of NodeJS
 * Mainly for debugging only, SHOULD NOT be used in production.
 *
 * @param obj
 */
function inspectObj(obj) {
  console.log((0, _util.inspect)(obj, { depth: 7, color: true }));
}