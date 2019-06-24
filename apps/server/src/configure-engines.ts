import { rootContainer, installDefaults } from './init';
import { config } from './config';
import { getInitializedEngine } from './modules/engine';
import { syncTasks } from './modules/contrib-install-controller/sync-tasks';
import { AppsService } from './modules/apps';
import { initDb } from './common/db';

initDb()
  .then(() => getInitializedEngine(config.defaultEngine.path, { forceCreate: false }))
  .then(engine => syncTasks(engine))
  .then(() => {
    console.log('[log] init test engine done');
    return installDefaults(rootContainer.resolve(AppsService));
  })
  .catch(error => {
    console.error(error);
    console.error(error.stack);
    process.exit(1);
  });
