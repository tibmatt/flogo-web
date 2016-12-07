import {runShellCMD} from '../../../../common/utils';
import {build} from './build';

var path = require('path');

module.exports = {
  create(enginePath, options) {
    options = options || {};
    let enginePathInfo = path.parse(enginePath);

    let command = ['create'];
    if(options.libVersion) {
      command.push('-flv', options.libVersion);
    }
    command.push(enginePathInfo.name);

    return _exec(enginePathInfo.dir, command);
  },
  build: build,
  add: {
    flow(enginePath, flowPath) {
      return _exec(enginePath, ['add', 'flow', flowPath]);
    },
    palette(enginePath, palettePath, options) {
      return _addItem(enginePath, 'palette', palettePath, options);
    },
    trigger(enginePath, triggerPath, options) {
      return _addItem(enginePath, 'trigger', triggerPath, options);
    },
    activity(enginePath, activityPath, options) {
      return _addItem(enginePath, 'activity', activityPath, options);
    },
  },
  delete: {
    flow(enginePath, flowName) {
      return _exec(enginePath, ['del', 'flow', flowName]);
    },
    trigger(enginePath, triggerNameOrPath) {
      return _exec(enginePath, ['del', 'trigger', triggerNameOrPath]);
    },
    activity(enginePath, activityNameOrPath) {
      return _exec(enginePath, ['del', 'activity', activityNameOrPath]);
    }
  }
};

function _addItem(enginePath, itemType, itemPath, options) {
  options = options || {};
  let commandParams = ['add'];
  if (options.version) {
    commandParams.push('-v', options.version);
  }
  commandParams = commandParams.concat([itemType, itemPath]);
  return _exec(enginePath, commandParams);
}

function _exec(enginePath, params) {
  console.log(`[info] Exec command: flogo ${params&&params.join(' ')} in ${enginePath}`);
  return runShellCMD('flogo', params, {cwd: enginePath});
}
