import fs from 'fs';
import path from 'path';
import { spawn } from 'cross-spawn';
import * as ps from 'ps-node';

import { fileExists } from '../../common/utils/file';
import { processHost } from '../../common/utils/process';
import { config } from '../../config/app-config';

export const execController = {
  start(enginePath, engineName, options) {
    options = Object.assign({}, { binDir: 'bin' }, options);

    console.log(`[info] starting engine ${engineName}`);

    return new Promise((resolve, reject) => {
      const binPath = path.join(enginePath, options.binDir);
      console.log('[info] defaultEngineBinPath: ', binPath);

      if (fileExists(path.join(binPath, engineName))) {
        const settings = config.buildEngine.config.services || [];
        const stateRecorder = settings.find(service => service.name === 'stateRecorder');
        const engineTester = settings.find(service => service.name === 'engineTester');
        const { host: stateHost, port: statePort } = stateRecorder.settings;
        const env = {
          FLOGO_LOG_LEVEL: 'DEBUG',
          TESTER_ENABLED: 'true',
          TESTER_PORT: engineTester.settings.port,
          TESTER_SR_SERVER: `${stateHost}:${statePort}`,
        };
        const engineProcess = startProcess(engineName, binPath, env);
        _setupLogging(engineProcess, engineName, options);

        resolve(engineProcess);
      } else {
        console.log(`[error] engine ${engineName} doesn't exist`);
        reject(new Error(`[error] engine ${engineName} doesn't exist`));
      }
    });
  },
  stop(name) {
    return new Promise((resolve, reject) => {
      ps.lookup(
        {
          command: name,
        },
        (err, resultList) => {
          if (err) {
            reject(new Error(err));
            return;
          }

          const process = resultList.shift();
          if (process) {
            console.log(
              '[info] Stop engine PID: %s, COMMAND: %s, ARGUMENTS: %s',
              process.pid,
              process.command,
              process.arguments
            );
            ps.kill(
              process.pid,
              {
                timeout: 60,
              },
              killErr => {
                if (killErr) {
                  reject(new Error(killErr));
                  return;
                }
                console.log(
                  '[info] Stop engine Process %s has been killed!',
                  process.pid
                );
                resolve(true);
              }
            );
          } else {
            resolve(false);
          }
        }
      );
    });
  },
};

function _setupLogging(engineProcess, engineName, options) {
  if (options.logger) {
    const logger = options.logger;
    logger.registerDataStream(engineProcess.stdout, engineProcess.stderr);
  } else if (options.logPath) {
    const logFile = path.join(options.logPath, `${engineName}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    console.log('[info] engine logFile: ', logFile);
    // log engine output
    engineProcess.stdout.pipe(logStream);
    engineProcess.stderr.pipe(logStream);
  } else {
    console.warn('[warning] no logging setup for engine run');
  }
}

function startProcess(engineName, cwd, env) {
  console.log('[DEBUG] Env for test runner (will be merged with the system env):');
  console.log(env);
  const commandEnv = Object.assign({}, env, process.env);

  let command = `./${engineName}`;
  let args = [];
  if (processHost.isWindows()) {
    command = process.env.comspec;
    args = ['/c', engineName];
  }
  return spawn(command, args, { cwd, env: commandEnv });
}
