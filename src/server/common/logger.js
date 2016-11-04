import path from 'path';
import winston from 'winston';
import { runShellCMD } from '../common/utils'

import {config} from '../config/app-config';

// TODO: use getLogger(loggerIdentifier) ex: getLogger('testEngine')

var logger = new winston.Logger({
  level: 'debug',
  transports: [
    new winston.transports.File({ filename: path.join(config.rootPath, 'winston.log') })
  ]
});

runShellCMD( 'npm', ['run','start-logger'], {} )
  .then((result)=> {
    console.log('start-logger started')
  })
  .catch((err)=> {
      console.log('Error starting start-logger:');
      console.log(err);
  });


export const engineLogger = logger;


