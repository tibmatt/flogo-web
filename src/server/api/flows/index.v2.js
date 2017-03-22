import { config } from '../../config/app-config';

const basePathV2 = config.app.basePathV2;

export function flows(router) {
  router.get(`${basePathV2}/flows`, listFlows);
  router.post(`${basePathV2}/flows`, createFlow);

  router.get(`${basePathV2}/flows/recent`, findRecentFlows);

  router.get(`${basePathV2}/flows/:flowId`, getFlow);
  router.put(`${basePathV2}/flows/:flowId`, updateFlow);
  router.del(`${basePathV2}/flows/:flowId`, deleteFlow);
}

function* listFlows() {
  this.status = 501;
  yield;
}

function* createFlow() {
  this.status = 501;
  yield;
}

function* getFlow() {
  this.status = 501;
  yield;
}

function* findRecentFlows() {
  this.status = 501;
  yield;
}

function* updateFlow() {
  this.status = 501;
  yield;
}

function* deleteFlow() {
  this.status = 501;
  yield;
}
