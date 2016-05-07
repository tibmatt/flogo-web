import {config, activitiesDBService} from '../../config/app-config';
import {DBService} from '../../common/db.service';
import _ from 'lodash';

let basePath = config.app.basePath;
//let dbName = config.activities.db;

let _dbService = activitiesDBService;

export function activities(app, router){
  if(!app){
    console.error("[Error][api/activities/index.js]You must pass app");
  }

  router.get(basePath+"/activities", getActivities);
  router.post(basePath+"/activities", installActivities);
  router.delete(basePath+"/activities", deleteActivities);
}

function* getActivities(next){
  let data = [];

  data = yield _dbService.allDocs({ include_docs: true })
    .then(res => res.rows || [])
    .then(rows => rows.map(row => row.doc ? _.pick(row.doc, ['_id', 'name', 'version', 'description']) : []));

  console.log(data);
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
