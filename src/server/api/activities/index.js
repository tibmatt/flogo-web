import {config} from '../../config/app-config';

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
  console.log("getActivities");
  this.body = 'getActivities';
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