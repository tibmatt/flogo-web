import { container } from './injector/root';
import { config } from './config/app-config';
import { apps, indexer } from './common/db';
import { getInitializedEngine } from './modules/engine';
import { installDefaults, ensureDefaultDirs } from './modules/init';
import { syncTasks } from './modules/contrib-install-controller/sync-tasks';

ensureDefaultDirs()
  .then(() => getInitializedEngine(config.defaultEngine.path, { forceCreate: false }))
  .then(engine => syncTasks(engine, true))
  .then(() => {
    console.log('[log] init test engine done');
    return installDefaults();
  })
  .then(() => Promise.all([apps.compact(), indexer.compact()]))
  .catch(error => {
    console.error(error);
    console.error(error.stack);
    process.exit(1);
  });
