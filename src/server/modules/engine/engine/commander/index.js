import {runShellCMD} from '../../../../common/utils';
import {build} from './build';

var path = require('path');

module.exports = {
  create(enginePath) {
    let enginePathInfo = path.parse(enginePath);
    console.log('cwd:', enginePathInfo.dir);
    return runShellCMD('flogo', ['create', enginePathInfo.name], {cwd: enginePathInfo.dir});
  },
  build: build,
  add: {
    flow(enginePath, flowPath) {
      return runShellCMD('flogo', ['add', 'flow', flowPath], {cwd: enginePath});
    },
    palette(enginePath, palettePath, options) {
      options = options || {};
      let commandParams = [];
      if (options.version) {
        commandParams.push('-v', options.version);
      }
      return runShellCMD('flogo', ['add', 'palette', palettePath], {cwd: enginePath});
    }
  },
  delete: {
    flow(enginePath, flowName) {
      return runShellCMD('flogo', ['del', 'flow', flowName], {cwd: enginePath});
    }
  }
};
