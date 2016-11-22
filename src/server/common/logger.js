import path from 'path';
import winston from 'winston';
import {splitLines, cleanAsciiColors} from '../common/utils';

import {config} from '../config/app-config';

// TODO: use getLogger(loggerIdentifier) ex: getLogger('testEngine')

var logger = new winston.Logger({
  level: 'debug',
  transports: [
    new winston.transports.File({ filename: path.join(config.rootPath, 'winston.log') })
  ]
});



function isDebug(line) {
  return (line.indexOf('▶ DEBUG') !== -1 || line.indexOf('▶ INFO'));
}


logger.register = (stdout, stderr)=> {

  stdout.on('data', data => {
    splitLines(data.toString())
      .forEach(line => {
        line = cleanAsciiColors(line);
        logger.info(line)
      });
  });

  stderr.on('data', data => {
    splitLines(data.toString())
      .forEach(line => {
        line = cleanAsciiColors(line);
        if(isDebug(line)) {
          logger.info(line)
        }else {
          logger.error(line);
        }
      });
  });

}


export const engineLogger = logger;


