var path = require('path');
var spawn = require('child_process').spawn;

const COMMAND = 'flogo';

module.exports = {
  create(enginePath) {
    let enginePathInfo = path.parse(enginePath);
    console.log('cwd:', enginePathInfo.dir);
    return runShellCMD(COMMAND, ['create', enginePathInfo.name], {cwd: enginePathInfo.dir});
  },
  add: {
    palette(enginePath, palettePath, options) {

      options = options || {};
      let commandParams = [];
      if (options.version) {
        commandParams.push('-v', options.version);
      }

      return runShellCMD(COMMAND, ['add', 'palette', palettePath], {cwd: enginePath});
    }
  },
  build(enginePath, opts) {
    const self = this;

    let defaultOpts = {
      optimize: false, incorporateConfig: false,
      compile: {os: false, arch: false}
    };
    opts = Object.assign({}, defaultOpts, opts);

    const defaultEnginePath = path.join(enginePath);

    const args = [
      opts.optimize ? '-o' : '',
      opts.incorporateConfig ? '-i' : ''
    ].join(' ').trim();

    let env = {};

    if (opts.compile) {
      if (opts.compile.os) {
        env['GOOS'] = opts.compile.os;
      }

      if (opts.compile.arch) {
        env['GOARCH'] = opts.compile.arch
      }
    }

    console.log(`[log] Build flogo: "flogo build ${args}" compileOpts:`);

    return runShellCMD(COMMAND, ['build'].concat(args.split(' ')), {
      cwd: defaultEnginePath,
      env: Object.assign({}, process.env, env)
    });
  }
};

function runShellCMD(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const _cmd = spawn(cmd, args, opts);
    let _data = '';
    let errData = '';

    console.log(`[info] run command: ${cmd} ${args.join(' ')}`);

    _cmd.stdout.on('data', (data) => {
      _data += data;
    });

    _cmd.stderr.on('data', (data) => {
      errData += data instanceof Buffer ? data.toString() : data;
    });

    _cmd.on('close', (code) => {
      if (code !== 0) {
        console.log(`[log] command exited with code ${code}: ${cmd} ${args.join(' ')}`);
        reject(errData);
      } else {
        resolve(_data);
      }
    });
  });
}
