import { parseJSON } from '../../../common/utils';
import { logger } from '../../../common/logging';
import { runShellCMD } from '../../../common/utils/process';
import { build } from './build';

const path = require('path');

export const commander = {
  /**
   *
   * @param enginePath
   * @param options
   * @param {string} [options.libVersion] - specify the flogo-lib version this is the same as flogo's flv option and
   * it will be passed as is
   * @param {string} [options.flogoDescriptor] - specify the flogo.json to create project from
   * @param {string} [options.vendor] - specify existing vendor directory to copy
   * @return {*}
   */
  create(enginePath, options) {
    options = options || {};
    const enginePathInfo = path.parse(enginePath);

    const command = ['create'];
    if (options.libVersion && options.libVersion !== 'latest') {
      command.push('-flv', options.libVersion);
    }

    if (options.flogoDescriptor) {
      command.push('-f', options.flogoDescriptor);
    }

    if (options.vendor) {
      command.push('-vendor', options.vendor);
    }

    command.push(enginePathInfo.name);

    return _exec(enginePathInfo.dir, command);
  },
  build,
  add: {
    flow: install,
    palette(enginePath, palettePath, options) {
      options = Object.assign({}, options, { isPalette: true });
      return install(enginePath, palettePath, options);
    },
    trigger: install,
    activity: install,
  },
  install,
  delete: {
    trigger: uninstall,
    activity: uninstall,
  },
  list(enginePath) {
    return _exec(enginePath, ['list', '-json']).then(output => parseJSON(output));
  },
};

function install(enginePath, contribPath, options) {
  options = options || {};
  const commandParams = ['install'];

  if (options.version && options.version !== 'latest') {
    commandParams.push('-v', options.version);
  }

  if (options.isPalette) {
    commandParams.push('-p', contribPath);
  } else {
    commandParams.push(contribPath);
  }

  return _exec(enginePath, commandParams);
}

function uninstall(enginePath, contribNameOrPath) {
  return _exec(enginePath, ['uninstall', contribNameOrPath]);
}

function _exec(enginePath, params) {
  logger.info(`Exec command: flogo ${params && params.join(' ')} in ${enginePath}`);
  return runShellCMD('flogo', params, { cwd: enginePath });
}
