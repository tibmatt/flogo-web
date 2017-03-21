import path from 'path';
import winston from 'winston';
import { splitLines, cleanAsciiColors } from '../../common/utils';

import { config } from '../../config/app-config';

// TODO: use getLogger(loggerIdentifier) ex: getLogger('testEngine')

const engineLogger = new winston.Logger({
  level: 'debug',
  transports: [
    new winston.transports.File({ filename: path.join(config.rootPath, 'winston.log') })
  ],
});

function isDebug(line) {
  return (line.indexOf('▶ DEBUG') !== -1 || line.indexOf('▶ INFO'));
}


engineLogger.registerDataStream = (stdout, stderr) => {

  if (stdout) {
    stdout.on('data', data => {
      splitLines(data.toString())
        .forEach(line => {
          line = cleanAsciiColors(line);
          engineLogger.info(line)
        });
    });
  }

  if (stderr) {
    stderr.on('data', data => {
      splitLines(data.toString())
        .forEach(line => {
          line = cleanAsciiColors(line);
          if(isDebug(line)) {
            engineLogger.info(line)
          }else {
            engineLogger.error(line);
          }
        });
    });
  }

};


export { engineLogger };


