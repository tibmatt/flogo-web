import { config } from '../../config/app-config';
import { Database } from '../database.service';
import { logger } from '../logging';

logger.info(`Starting contribs DB at ${config.contribs.dbPath}`);
const db = new Database({ filename: config.contribs.dbPath, autoload: true }, [
  { fieldName: 'ref', unique: true },
]);
export { db as contribs };
