import { config, originalConfig, resetConfiguration, setConfiguration as setNewConfiguration } from '../../config/app-config';
import {isJSON } from '../../common/utils';
import _ from 'lodash';
import request from 'co-request';

let basePath = config.app.basePath;


export function configuration(app, router) {
  if(!app){
    console.error("[Error][api/ping/index.js]You must pass app");
  }

  router.post(basePath+"/configuration/", setConfiguration);
  router.get(basePath+"/configuration/reset", reset);
  router.get(basePath+"/configuration",  getConfiguration);
}

function* getConfiguration(next) {
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

function* reset(next){

  try{
    resetConfiguration();
    this.body = config;

  }catch(err){
    this.throw(err.message, 500);
  }

  yield next;
}

function* setConfiguration(next){

  try{
    let data = this.request.body.configuration||{};

    if(typeof this.request.body == 'string'){
      if(isJSON(this.request.body.configuration)){
        data = JSON.parse(this.request.body.configuration);
      }
    }

    console.log('The new configuration is:');
    console.log(data);
    setNewConfiguration(data);

    this.body = config;

  }catch(err){
    this.throw(err.message, 500);
  }

  yield next;
}

