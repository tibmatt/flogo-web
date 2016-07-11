'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.btoa = btoa;
exports.atob = atob;
exports.isExisted = isExisted;
exports.isDirectory = isDirectory;
exports.readDirectoriesSync = readDirectoriesSync;
exports.isJSON = isJSON;
exports.readJSONFileSync = readJSONFileSync;
exports.writeJSONFileSync = writeJSONFileSync;
exports.flogoIDEncode = flogoIDEncode;
exports.flogoIDDecode = flogoIDDecode;
exports.flogoGenTaskID = flogoGenTaskID;
exports.flogoGenTriggerID = flogoGenTriggerID;
exports.genNodeID = genNodeID;
exports.convertTaskID = convertTaskID;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _performanceNow = require('performance-now');

var _performanceNow2 = _interopRequireDefault(_performanceNow);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _constants = require('../common/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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