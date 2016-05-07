import {config, dbService, triggersDBService} from '../../config/app-config';
import {DBService} from '../../common/db.service';
import {flogoFlowToJSON} from '../../common/flow.model';
import {flogoIDDecode} from '../../common/utils';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';

let basePath = config.app.basePath;
let dbName = config.db;
let triggerDBName = config.triggers.db;

let _dbService = dbService;
let _triggerDBService = triggersDBService;

function generateBuild(id){
  return new Promise((resolve, reject)=>{
    console.log('generateBuild');

    let flowID = flogoIDDecode(id);
    console.log('id: ', id);
    console.log('flowID: ', flowID);
    _dbService.db.get(flowID).then((doc)=>{
      console.log(doc);

      let flowJSON = flogoFlowToJSON(doc);
      console.log(flowJSON);

      resolve(flowJSON);

    }).catch((err)=>{
      reject(err);
    })
  });
}

export function flowsDetail(app, router){
  if(!app){
    console.error("[Error][api/flows.detail/index.js]You must pass app");
  }
  router.get(basePath+"/flows/:id/build", getBuild);
}

function* getBuild(next){

  console.log("getBuild");

  //let engineDirPath = path.resolve(config.rootPath, config.testEngine.path);
  //engineDirPath = path.join(engineDirPath, config.testEngine.name);
  //let engineFilePath = path.join(engineDirPath, 'bin', config.testEngine.name);
  //
  //let data = fs.readFileSync(engineFilePath);

  //console.log("data: ", data);
  let id = this.params.id;

  let data = yield generateBuild(id);

  //data = yield _dbService.allDocs({ include_docs: true })
  //  .then(res => res.rows || [])
  //  .then(rows => rows.map(row => row.doc ? _.pick(row.doc, ['_id', 'name', 'version', 'description']) : []));
  //
  //console.log(data);
  this.body = data;
  yield next;
}

