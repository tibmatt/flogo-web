import { config } from '../../config/app-config';
import { isJSON } from '../../common/utils';
import _ from 'lodash';
import request  from 'co-request';
import path from 'path';

let basePath = config.app.basePath;

export function flowsRun(app, router) {
  if(!app) {
    console.error("[Error][api/flows.run/index.js]You must pass app");
  }

  router.post(basePath+'/flows/run/flows', flows);
  router.post(basePath+'/flows/run/flow/start', flowStart);
  router.get(basePath+'/flows/run/instances/:id/status', statusInstance);
  router.get(basePath+'/flows/run/instances/:id/steps', stepsInstance);
  router.get(basePath+'/flows/run/instances/:id', instanceById);
  router.get(basePath+'/flows/run/instances/:idInstance/snapshot/:idSnapshot', getSnapshot);
  router.post(basePath+'/flows/run/restart', restart);
  router.get(basePath+'/flows/run/flows/:id', getProcessFlow);
}

function* getProcessFlow(next) {
  let process = config.processServer;
  let id = this.params.id;
  let uri =  getUrl(process) + '/flows/' + id;
  this.body = id;

  try {
    let result = yield request({
      uri: uri,
      method: 'GET'
    });

    this.body = result.body;
  }catch(err) {
    this.throw(err.message, 500);
  }

  yield next;
}

function* restart(next) {
  let engine = config.engine;
  let data = this.request.body;

  let uri = getUrl(engine) + '/flow/restart';

  try {
    let result = yield request({
      uri: uri,
      method: 'POST',
      body: data,
      json: true
    });

    this.body = result.body;
  }catch(err) {
    this.throw(err.message, 500);
  }

  yield next;
}

function* getSnapshot(next) {
  let state = config.stateServer;
  let idInstance = this.params.idInstance;
  let idSnapshot = this.params.idSnapshot;

  let uri = getUrl(state) + '/instances/' + idInstance + '/snapshot/' + idSnapshot;

  try {
    let result = yield request({
      uri: uri,
      method: 'GET'
    });

    this.body = result.body;
  }catch(err) {
    this.throw(err.message, 500);
  }

  yield next;
}

function* instanceById(next) {
  let state = config.stateServer;
  let id = this.params.id;
  let uri = getUrl(state) + '/instances/' + id;

  try {
    let result = yield request({
      uri: uri,
      method: 'GET'
    });

    this.body = result.body;
  }catch(err) {
    this.throw(err.message, 500);
  }

  yield next;
}

function* stepsInstance(next) {
  let state = config.stateServer;
  let id = this.params.id;
  let uri = getUrl(state) + '/instances/' + id + '/steps';
  this.body = id;

  try {
    let result = yield request({
      uri: uri,
      method: 'GET'
    });

    this.body = result.body;
  }catch(err) {
    this.throw(err.message, 500);
  }

  yield next;
}

function* statusInstance(next) {
  let state = config.stateServer;
  let id = this.params.id;
  let uri =  getUrl(state) + '/instances/' + id + '/status';
  this.body = id;

  try {
    let result = yield request({
      uri: uri,
      method: 'GET'
    });

    this.body = result.body;
  }catch(err) {
    this.throw(err.message, 500);
  }

  yield next;
}

function getUrl(service) {
  let url = service.protocol + '://' + service.host;

  if(service.port) {
    url += ':' + service.port
  }

  return url;
}

function* flowStart(next) {
  let data = this.request.body;
  let engine = config.engine;
  let process = config.processServer;

  let uri = getUrl(engine) + '/flow/start';
  data.actionUri =  getUrl(process) + '/flows/' + data.flowId;
  data.flowUri = data.actionUri;
  delete data.flowId;

  try {

      let result = yield request({
        uri: uri,
        method: 'POST',
        body: data,
        json: true
      });

      this.body = result.body;

  }catch (err) {
    this.throw(err.message, 500);
  }

  yield next;

}

function* flows(next) {
  let data = this.request.body;
  let process = config.processServer;
  let uri = getUrl(process) + '/flows';

  try {
    let result = yield request({
      uri: uri,
      method: 'POST',
      body: data,
      json: true
    });

    this.body = result.body;
  } catch(err) {
    this.throw(err.message, 500);
  }

  yield next;
}


