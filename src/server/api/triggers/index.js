import {config, triggersDBService} from '../../config/app-config';
import _ from 'lodash';

let basePath = config.app.basePath;

export function triggers(app, router){
  if(!app){
    console.error("[Error][api/triggers/index.js]You must pass app");
  }
  router.get(basePath+"/triggers", getTriggers);
}

function* getTriggers(next){
  console.log('get triggers');
  let data = [];

  data = yield triggersDBService.allDocs({ include_docs: true })
    .then(triggers => triggers.map(trigger => _.pick(trigger, ['_id', 'name', 'version', 'description'])));
  
  this.body = data;
  yield next;
}

