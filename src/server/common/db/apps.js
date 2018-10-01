import { config } from '../../config/app-config';
import { Database } from '../database.service';
import { logger } from '../logging';

logger.info(`Starting apps DB at ${config.apps.dbPath}`);
const db = new Database({ filename: config.apps.dbPath, autoload: true }, [{ fieldName: 'name', unique: true }]);
export { db as apps };
