import {installAndConfigureTasks} from './modules/init';
import {getInitialisedTestEngine,getInitialisedBuildEngine} from './modules/engine';
installAndConfigureTasks()
  .then(()=> {
    console.log("[log] init test engine done");
    return getInitialisedTestEngine();
  })
  .then((testEngine) => {
    console.log("[log] init test engine done");
    return getInitialisedBuildEngine();
  });
