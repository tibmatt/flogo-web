import {config, activitiesDBService} from '../../config/app-config';
import _ from 'lodash';

let basePath = config.app.basePath;

export function activities(app, router){
  if(!app){
    console.error("[Error][api/activities/index.js]You must pass app");
  }

  router.get(basePath+"/activities", getActivities);
  router.post(basePath+"/activities", installActivities);
  router.delete(basePath+"/activities", deleteActivities);
}

function* getActivities(next){
  let data = yield activitiesDBService.allDocs({ include_docs: true })
    .then(activities => activities.map(activity => {
      return Object.assign({}, _.pick(activity, ['_id', 'name', 'title', 'version', 'description']), { title: _.get(activity, 'schema.title') });
    }));

  this.body = data;
  yield next;
}

function* installActivities(next){
  console.log("installActivities");
  this.body = 'installActivities';
  yield next;
}

function* deleteActivities(next){
  console.log("deleteActivities");
  this.body = 'deleteActivities';
  yield next;
}
