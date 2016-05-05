import {config} from '../../config/app-config';
import {DBService} from '../../common/db.service';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';

let basePath = config.app.basePath;
let dbName = config.triggers.db;

let _dbService = new DBService(dbName);

export function flowsDetail(app, router){
  if(!app){
    console.error("[Error][api/flows.detail/index.js]You must pass app");
  }
  router.get(basePath+"/flows/:id/build", getBuild);
}

function* getBuild(next){

  console.log("getBuild");

  let engineDirPath = path.resolve(config.rootPath, config.testEngine.path);
  engineDirPath = path.join(engineDirPath, config.testEngine.name);
  let engineFilePath = path.join(engineDirPath, 'bin', config.testEngine.name);

  let data = fs.readFileSync(engineFilePath);

  console.log("data: ", data);

  //data = yield _dbService.allDocs({ include_docs: true })
  //  .then(res => res.rows || [])
  //  .then(rows => rows.map(row => row.doc ? _.pick(row.doc, ['_id', 'name', 'version', 'description']) : []));
  //
  //console.log(data);
  this.body = data;
  yield next;
}

