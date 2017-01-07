import {config} from './config/app-config';
import {syncTasks,installSamples,getInitializedEngine,ensureDefaultDirs} from './modules/init';

ensureDefaultDirs()
  .then(() => getInitializedEngine(config.defaultEngine.path, {
    forceCreate: true
  }))
  .then(engine => {
    return syncTasks(engine);
  })
  .then(() => {
    console.log("[log] init test engine done");
    return installSamples();
  })
  .catch(error => {
    console.error(error);
    console.error(error.stack);
  });
