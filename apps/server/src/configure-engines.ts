import { rootContainer } from './init-injector';
import { config } from './config/app-config';
import { TOKENS } from './core';
import { Database } from './common/database.service';
import { getInitializedEngine } from './modules/engine';
import { installDefaults, ensureDefaultDirs } from './modules/init';
import { syncTasks } from './modules/contrib-install-controller/sync-tasks';
import { AppImporterFactory } from './modules/importer';

ensureDefaultDirs()
  .then(() => getInitializedEngine(config.defaultEngine.path, { forceCreate: false }))
  .then(engine => syncTasks(engine))
  .then(() => {
    console.log('[log] init test engine done');
    return installDefaults(rootContainer.resolve(AppImporterFactory));
  })
  .then(() => {
    const apps = rootContainer.get<Database>(TOKENS.AppsDb);
    const indexer = rootContainer.get<Database>(TOKENS.ActionIndexerDb);
    return Promise.all([apps.compact(), indexer.compact()]);
  })
  .catch(error => {
    console.error(error);
    console.error(error.stack);
    process.exit(1);
  });
