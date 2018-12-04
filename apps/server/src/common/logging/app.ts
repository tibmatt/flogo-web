import * as path from 'path';
import { createLogger, format, transports } from 'winston';

import { config } from '../../config/app-config';

const logger = createLogger({
  level: config.logLevel,
  transports: [
    new transports.Console({
      format: format.combine(format.timestamp(), format.colorize(), format.simple()),
    }),
    new transports.File({
      filename: path.join(config.logsPath, 'app.log'),
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

export { logger };
