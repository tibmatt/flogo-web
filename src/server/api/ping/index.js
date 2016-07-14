import { config } from '../../config/app-config';
import {isJSON } from '../../common/utils';
import _ from 'lodash';
import request from 'co-request';

let basePath = config.app.basePath;

let services = [];
services['engine']      = config.engine;
services['stateServer'] = config.stateServer;
services['flowServer']  = config.processServer;
services['flogo-web']  = config.flogoWeb;
services['flogo-web-activities']  = config.flogoWebActivities;
services['flogo-web-triggers']  = config.flogoWebTriggers;

export function ping(app, router){
  if(!app){
    console.error("[Error][api/ping/index.js]You must pass app");
  }

  router.post(basePath+"/ping/service", pingService);
  router.get(basePath+"/ping/configuration", pingConfiguration);
}

function* pingConfiguration(next) {
  this.body = {
    engine: config.engine,
    stateServer:  config.stateServer,
    flowServer: config.processServer,
    webServer: config.webServer,
    db: config.flogoWeb,
    activities: config.flogoWebActivities,
    triggers: config.flogoWebTriggers
  };
  yield next;
}

function* pingService(next){

  try{
    let data = this.request.body.config ||{};
    if(typeof this.request.body == 'string'){
      if(isJSON(this.request.body)){
        data = JSON.parse(this.request.body);
      }
    }

    let service = services[data.name];

    if(typeof service == 'undefined') {
      console.log(data);
      throw new Error('Wrong service name in pingService');
    }

    let protocol = data.protocol || service.protocol;
    let host     = data.host     || service.host;
    let port     = data.port     || service.port;
    let testPath = data.testPath || service.testPath;
    let url = protocol + '://' + host + ':' + port + '/' + testPath;

    let result = yield request(url);
    if(result.statusCode && result.statusCode != 200) {
      throw new Error('Error');
    }
    this.body = result.body;
  }catch(err){
    this.throw(err.message, 500);
  }

  yield next;
}

