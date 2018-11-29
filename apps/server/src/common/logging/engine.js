import * as path from 'path';
import * as winston from 'winston';

import { config } from '../../config/app-config';

function splitLines(str) {
  let lines = (str || '').match(/[^\r\n]+/g);
  return lines || [];
}

function cleanAsciiColors(line) {
  return line.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

// TODO: use getLogger(loggerIdentifier) ex: getLogger('testEngine')

const engineLogger = new winston.Logger({
  level: 'debug',
  transports: [new winston.transports.File({ filename: path.join(config.localPath, 'engine.log') })],
});

function isDebug(line) {
  return line.indexOf('▶ DEBUG') !== -1 || line.indexOf('▶ INFO');
}

engineLogger.registerDataStream = (stdout, stderr) => {
  if (stdout) {
    stdout.on('data', data => {
      splitLines(data.toString()).forEach(line => {
        line = cleanAsciiColors(line);
        engineLogger.info(line);
      });
    });
  }

  if (stderr) {
    stderr.on('data', data => {
      splitLines(data.toString()).forEach(line => {
        line = cleanAsciiColors(line);
        if (isDebug(line)) {
          engineLogger.info(line);
        } else {
          engineLogger.error(line);
        }
      });
    });
  }
};

export { engineLogger };
