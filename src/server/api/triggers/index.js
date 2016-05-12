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
  let data = [];

  data = yield triggersDBService.allDocs({ include_docs: true })
    .then(triggers => triggers.map(trigger => {
      return Object.assign({}, _.pick(trigger, ['_id', 'name', 'title', 'version', 'description']), { title: _.get(trigger, 'schema.title')});
    }));

  this.body = data;
  yield next;
}

