import path from 'path';
import winston from 'winston';

import { config } from '../../config/app-config';

const logger = new winston.Logger({
  level: config.logLevel,
  transports: [
    new winston.transports.Console({ timestamp: true, colorize: true, showLevel: true }),
    new winston.transports.File({ filename: path.join(config.localPath, 'app.log'), json: false }),
  ],
});

export { logger };
