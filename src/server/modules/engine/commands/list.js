import {runShellCMD} from '../../../common/utils'

const MAIN_PATTERN = /(Activities:)([\s\S]*)(Triggers:)([\s\S]*)/;
const LINE_PATTERN = /(\w+) \[(.*)\]( \((\w+)\))?/;

/**
 *
 * @param pathToEngine
 * @returns {*} {activities, triggers}
 */
export function list(pathToEngine) {
  return runShellCMD('flogo', ['list'], {
    cwd: pathToEngine
  })
    .then(processOutput);
}

function processOutput(output) {
  let matches = (output||"").match(MAIN_PATTERN);
  let result = {activities: [], triggers: []};

  if (matches[2]) {
    result.activities = parseLines(matches[2]);
  }

  if (matches[3]) {
    result.triggers = parseLines(matches[3]);
  }

  return result;
}

function parseLines(string) {
  return string.split('\n')
    .map(function(line) {
      return line.match(LINE_PATTERN);
    })
    .filter(elem => !!elem)
    .map(elem => ({
      name: elem[1],
      path: elem[2],
      isLocal: !!(elem[4] && elem[4] == 'local')
    }))
}
