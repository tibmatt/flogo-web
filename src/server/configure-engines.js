import { config } from './config/app-config';
import { apps, indexer, contribs } from './common/db';
import { syncTasks, installDefaults, getInitializedEngine, ensureDefaultDirs } from './modules/init';

ensureDefaultDirs()
  .then(() => getInitializedEngine(config.defaultEngine.path, { forceCreate: true }))
  .then(engine => syncTasks(engine, true))
  .then(() => {
    console.log('[log] init test engine done');
    return installDefaults();
  })
  .then(() => Promise.all([
    apps.compact(),
    indexer.compact(),
    contribs.compact(),
  ]))
  .catch(error => {
    console.error(error);
    console.error(error.stack);
    process.exit(1);
  });
