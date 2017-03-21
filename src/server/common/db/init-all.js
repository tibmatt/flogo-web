import { flowsDBService, appsDBService } from '../../config/app-config';


/**
 * Init all dbs
 * @returns {Promise.<*>} Resolves when all databases are initialized
 */
export function initAllDbs() {

  return Promise.all([
    flowsDBService.init(),
    appsDBService.init()
  ]);

}
