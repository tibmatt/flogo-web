import {
  flowsDBService,
  appsDBService
} from '../../config/app-config';

import { initViews as initAppViews } from './apps';
import { initViews as initFlowsViews } from './flows';

/**
 * Create all the views
 * @returns {Promise.<*>} Resolves when all views are created
 */
export function createViews() {
  return Promise.all([
      initFlowsViews(flowsDBService.db),
      initAppViews(appsDBService.db)
  ]);
}
