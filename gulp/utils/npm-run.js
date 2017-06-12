import cp from 'child_process';
import os from 'os';

/**
 * Spawn an npm script
 * @example
 *  npmRun('test', { cwd: '/Users/johndoe/project' })
 *
 * @example
 *  npmRun('test', { scriptArgs: ['./file1.js', './dir/**'], cwd: '/Users/johndoe/project' })
 *
 * @param {string} command - command to run e.g. "start" or "test"
 * @param {object} [options] - options
 * @param {[string]} [options.scriptArgs] - parameters to pass to the script
 * @param {string} [options.cwd] - path to the directory where the package.json is
 * @param {object} [options.env] - environment variables
 * @return {Promise}
 */
export function npmRun(command, options = {}) {
  const opts = makeOptions(command, options);
  const execOptions = opts.execOptions;
  // execOptions.stdio = 'inherit';

  const npm = getNpmBinName();
  const child = cp.spawn(npm, opts.args, execOptions);

  child.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  child.stderr.on('data', function (data) {
    console.error(data.toString());
  });

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      // code 0 == success
      if (code == 0) {
        return resolve(code);
      }
      reject(code);
    });
  });

}

/**
 * Run an npm script and return when the script finishes its execution
 * @example
 *  npmRunExec('test', { cwd: '/Users/johndoe/project' })
 *    .then(result => console.log(result))
 *    .catch(error => console.error(error))
 *
 * @example
 *  npmRunExec('test', { scriptArgs: ['./file1.js', './dir/**'], cwd: '/Users/johndoe/project' })
 *    .then(result => console.log(result))
 *    .catch(error => console.error(error))
 *
 * @param {string} command - command to run e.g. "start" or "test"
 * @param {object} [options] - options
 * @param {[string]} [options.scriptArgs] - parameters to pass to the script
 * @param {string} [options.cwd] - path to the directory where the package.json is
 * @param {object} [options.env] - environment variables
 * @return {Promise}
 */
export function npmRunExec(command, options = {}) {
  const opts = makeOptions(command, options);
  const execOptions = opts.execOptions;

  const npm = getNpmBinName();

  return new Promise((resolve, reject) => {
    cp.exec([npm].concat(opts.args).join(' '), execOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

function getNpmBinName() {
  return os.platform() === 'win32' ? 'npm.cmd' : 'npm';
}

function makeOptions(command, options) {
  const args = ['run', command];
  let { scriptArgs, cwd, env } = options;

  const execOptions = {};
  if (cwd) {
    execOptions.cwd = cwd;
  }
  if (env) {
    execOptions.env = env;
  }

  scriptArgs = scriptArgs || [];
  if (scriptArgs.length > 0) {
    args.push('--');
    args.push(...scriptArgs);
  }

  return { args, execOptions };
}
