import {config} from '../../config/app-config';
import {engineLogger} from '../../common/logger';
import winston from 'winston';
import path from 'path';
import _ from 'lodash';

let basePath = config.app.basePath;
const MAX_LOGS_PER_REQUEST = 100;
const DEFAULT_LOGS_PER_REQUEST = 10;

export function logs(app, router){
  if(!app){
    console.error("[Error][api/logs/index.js]You must pass app");
  }

  router.get(basePath+"/logs", getLogs);
}

function* getLogs(next){

  var options = _.assign({}, {limit:DEFAULT_LOGS_PER_REQUEST,start:0,order:'desc',fields: ['level','timestamp','message'] }, this.request.query);
  if(options > MAX_LOGS_PER_REQUEST || options < DEFAULT_LOGS_PER_REQUEST) {
    options = DEFAULT_LOGS_PER_REQUEST;
  }

  this.body = yield _getLogs(options);
  yield next;
}

function _getLogs(options) {

  return new Promise((resolve, reject) => {
    engineLogger.query(options, (err, results) => {
      if (err) {
        reject(err) ;
      }
      resolve(results);
    });
  });
}


