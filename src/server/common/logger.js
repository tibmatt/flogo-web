import path from 'path';

import winston from 'winston';

import {config} from '../config/app-config';

// TODO: use getLogger(loggerIdentifier) ex: getLogger('testEngine')

export const engineLogger = new winston.Logger({
  level: 'debug',
  transports: [
    new winston.transports.File({ filename: path.join(config.rootPath, 'winston.log') })
  ]
});


