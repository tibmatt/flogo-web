import {config, dbService} from '../../config/app-config';
import {DBService} from '../../common/db.service';
import _ from 'lodash';

let basePath = config.app.basePath;
let dbName = config.triggers.db;

let _dbService = dbService;

export function triggers(app, router){
  if(!app){
    console.error("[Error][api/triggers/index.js]You must pass app");
  }
  router.get(basePath+"/triggers", getTriggers);
}

function* getTriggers(next){
  let data = [];

  data = yield _dbService.allDocs({ include_docs: true })
    .then(res => res.rows || [])
    .then(rows => rows.map(row => row.doc ? _.pick(row.doc, ['_id', 'name', 'version', 'description']) : []));

  console.log(data);
  this.body = data;
  yield next;
}

