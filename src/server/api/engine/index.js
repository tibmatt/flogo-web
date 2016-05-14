import {config, engines} from '../../config/app-config';
import _ from 'lodash';

let basePath = config.app.basePath;

export function engine(app, router){
  if(!app){
    console.error("[Error][api/engine/index.js]You must pass app");
  }
  router.get(basePath+"/engine/restart", restartEngine);
}

function* restartEngine(next){
  console.log('Restart Engine');

  let testEngine = engines.test;
  // let data = [];
  //
  // data = yield triggersDBService.allDocs({ include_docs: true })
  //   .then(triggers => triggers.map(trigger => _.pick(trigger, ['_id', 'name', 'version', 'description'])));
  //
  // this.body = data;
  //
  let data = {
    status: 200
  };
  if(testEngine.stop()){
    if(!testEngine.start()){
      data.status = 500;

      console.log("didn't start successful");
    }
  }else{
    data.status = 500;
    console.log("didn't stop successful");
  }

  this.body = data;

  yield next;
}
