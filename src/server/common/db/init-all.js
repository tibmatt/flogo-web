import {
  flowsDBService,
  activitiesDBService,
  triggersDBService,
  appsDBService
} from '../../config/app-config';

import { initViews as initAppViews } from './apps';
import { initViews as initFlowsViews } from './flows';

/**
 * Init all dbs
 * @returns {Promise.<*>} Resolves when all databases are initialized
 */
export function initAllDbs() {

  return Promise.all([
    activitiesDBService.init(),
    triggersDBService.init(),
    flowsDBService.init()
      .then(() => initFlowsViews(flowsDBService.db)),
    appsDBService.init()
      .then(() => initAppViews(appsDBService.db))
  ]);

}
