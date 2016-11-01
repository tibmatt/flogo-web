
import {syncTasks,installSamples} from './modules/init';
import {getInitialisedTestEngine,getInitialisedBuildEngine} from './modules/engine';

syncTasks()
  .then(()=> {
    console.log("[log] init test engine done");
    return getInitialisedTestEngine();
  })
  .then((testEngine) => {
    console.log("[log] init test engine done");
    return getInitialisedBuildEngine();
  })
  .then(() => {
    return installSamples();
  })
  .catch(error => {
    console.error(error);
    console.error(error.stack);
  });
