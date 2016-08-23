'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = list;

var _utils = require('../../../common/utils');

var MAIN_PATTERN = /(Activities:)([\s\S]*)(Triggers:)([\s\S]*)/;
var LINE_PATTERN = /(\w+) \[(.*)\]( \((\w+)\))?/;

/**
 *
 * @param pathToEngine
 * @returns {*} {activities, triggers}
 */
function list(pathToEngine) {
  return (0, _utils.runShellCMD)('flogo', ['list'], {
    cwd: pathToEngine
  }).then(processOutput);
}

function processOutput(output) {
  var matches = (output || "").match(MAIN_PATTERN);
  var result = { activities: [], triggers: [] };

  if (matches[2]) {
    result.activities = parseLines(matches[2]);
  }

  if (matches[3]) {
    result.triggers = parseLines(matches[3]);
  }

  return result;
}

function parseLines(string) {
  return string.split('\n').map(function (line) {
    return line.match(LINE_PATTERN);
  }).filter(function (elem) {
    return !!elem;
  }).map(function (elem) {
    return {
      name: elem[1],
      path: elem[2],
      isLocal: !!(elem[4] && elem[4] == 'local')
    };
  });
}