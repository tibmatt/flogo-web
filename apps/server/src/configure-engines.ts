import { rootContainer, installDefaults } from './init';
import { config } from './config/app-config';
import { TOKENS } from './core';
import { Database } from './common/database.service';
import { getInitializedEngine } from './modules/engine';
import { syncTasks } from './modules/contrib-install-controller/sync-tasks';
import { AppsService } from './modules/apps';

getInitializedEngine(config.defaultEngine.path, { forceCreate: false })
  .then(engine => syncTasks(engine))
  .then(() => {
    console.log('[log] init test engine done');
    return installDefaults(rootContainer.resolve(AppsService));
  })
  .then(() => {
    const apps = rootContainer.get<Database>(TOKENS.AppsDb);
    const indexer = rootContainer.get<Database>(TOKENS.ResourceIndexerDb);
    return Promise.all([apps.compact(), indexer.compact()]);
  })
  .catch(error => {
    console.error(error);
    console.error(error.stack);
    process.exit(1);
  });
