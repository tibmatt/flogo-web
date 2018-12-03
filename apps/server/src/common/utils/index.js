import _ from 'lodash';
import { inspect } from 'util';

import { FLOGO_TASK_ATTRIBUTE_TYPE, FLOGO_TASK_TYPE } from '../constants';
import { runShellCMD } from './process';

export * from './file';
export * from './json';

export function atob(str) {
  return new Buffer(str, 'base64').toString('binary');
}

/** *******
 * GitHub related utility functions
 */

// TODO support more git format
//  for the moment
//    https://github.com/:username/:projectname.git
//    https://github.com/:username/:projectname
const GITHUB_URL_PATTERN = /^(?:https\:\/\/)?github\.com\/(?:([\w\-]+)\/)(?:([\w\-]+)(?:\.git)?)$/.source;
const GITHUB_URL_SUBFOLDER_PATTERN = /^(?:https\:\/\/)?github\.com\/(?:([\w\-]+)\/)(?:([\w\-]+))\/(?:([\w\-/]+))$/
  .source;

export function parseGitHubURL(url) {
  let simplePattern = new RegExp(GITHUB_URL_PATTERN);
  let subfolderPattern = new RegExp(GITHUB_URL_SUBFOLDER_PATTERN);
  let result = null;

  let parsed = url.match(simplePattern);

  if (parsed) {
    result = {
      url: url,
      username: parsed[1],
      repoName: parsed[2],
    };
  } else {
    parsed = url.match(subfolderPattern);

    if (parsed) {
      result = {
        url: url,
        username: parsed[1],
        repoName: parsed[2],
        extraPath: parsed[3],
      };
    }
  }

  return result;
}

/** *******
 * CMD related utility functions
 */

/**
 * Git clone a given repo with `--recursive` flag, to an absolute path
 *
 * @param repoURL
 * @param folderPath
 * @returns {Promise}
 */
export function gitClone(repoURL, folderPath) {
  return new Promise((resolve, reject) => {
    runShellCMD('git', ['clone', '--recursive', repoURL, folderPath])
      .then(() => {
        resolve(true);
      })
      .catch(err => {
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
export function gitUpdate(folderPath) {
  return new Promise((resolve, reject) => {
    runShellCMD('git', ['pull', '--rebase'], { cwd: folderPath })
      .then(() => {
        resolve(true);
      })
      .catch(err => {
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
export function inspectObj(obj) {
  console.log(inspect(obj, { depth: 7, color: true }));
}

/**
 * Get the content of an external file
 * @param url
 * @returns {Promise|Promise<T>}
 */
export function getRemoteFileContent(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed to load file, status: ' + response.statusCode));
      }
      const body = [];
      response.on('data', chunk => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', err => reject(err));
  });
}

export function getDefaultValueByType(type) {
  const defaultValues = {
    [FLOGO_TASK_ATTRIBUTE_TYPE.STRING]: '',
    [FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER]: 0,
    [FLOGO_TASK_ATTRIBUTE_TYPE.LONG]: 0,
    [FLOGO_TASK_ATTRIBUTE_TYPE.DOUBLE]: 0.0,
    [FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN]: false,
    [FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT]: null,
    [FLOGO_TASK_ATTRIBUTE_TYPE.ARRAY]: [],
    [FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS]: null,
    [FLOGO_TASK_ATTRIBUTE_TYPE.COMPLEX_OBJECT]: null,
  };

  if (!Object.hasOwnProperty.call(defaultValues, type)) {
    type = FLOGO_TASK_TYPE.STRING;
  }

  return defaultValues[type];
}

export function isIterableTask(task) {
  return !_.isEmpty(_.get(task, 'settings.iterate'));
}
