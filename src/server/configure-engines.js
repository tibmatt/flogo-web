import {config} from './config/app-config';
import {initAllDbs} from './common/db/init-all';
import {syncTasks, installDefaults, installSamples, getInitializedEngine, ensureDefaultDirs} from './modules/init';

ensureDefaultDirs()
  .then(() => getInitializedEngine(config.defaultEngine.path, {
    forceCreate: true
  }))
  .then(engine => {
    return initAllDbs()
      .then(() => syncTasks(engine, true));
  })
  .then(() => {
    console.log("[log] init test engine done");
    return installDefaults()
      .then(() => installSamples());
  })
  .catch(error => {
    console.error(error);
    console.error(error.stack);
    throw error;
  });
