'use strict';

let Promise = require('bluebird');
let request = require('request-promise').defaults({json: true});

let ERRORS = require('./errors');

let utils = require('./utils');

let basePath = require('./base-path');
const BASE_PATH = basePath.buildFlogoBaseApiPath();

module.exports = {
  create,
  addTrigger,
  addActivity,
  getFlow,
  listFlows,
  getLast,
  ERRORS
};

let state = {
  lastCreated: null
};

function create(flowName) {
  return new Promise((resolve, reject) => {
    request
      .post({
        url: BASE_PATH + '/flows',
        body: {name: flowName},
        json: true
      })
      .then(res => {
        let flow = res;
        flow._id = flow.id;
        flow.id = utils.flogoIDEncode(flow.id);
        flow.name = flow.name || flowName;
        flow = augmentFlow(flow);
        state.lastCreated = Object.assign({}, flow);
        resolve(flow);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function addTrigger(triggerName) {
  return addTile('triggers', triggerName);
}

function addActivity(activityName) {
  return addTile('activities', activityName);
}

function getFlow(flowName) {
  return new Promise((resolve, reject) => {
    request
      .get({
        url: BASE_PATH + '/flows',
        qs: {
          name: flowName
        },
        json: true
      })
      .then(flows => {
        let flow = null;
        if(flows && flows.length > 0) {
          flow = augmentFlow(flows[0]);
        }
        resolve(flow);
      })
      .catch(err => {
        let reason = err;
        if (err.statusCode == 400) {
          reject({code: ERRORS.NOT_FOUND});
        }
        reject(reason);
      });
  });
}

function listFlows() {
  return request(BASE_PATH + '/flows')
    .then(flows => flows.map(augmentFlow));
}

function getLast() {
  if (state.lastCreated) {
    return Object.assign({}, state.lastCreated);
  }
  return null;
}

function addTile(type, name) {
  return new Promise((resolve, reject) => {

    let lastFlow = getLast();
    if(!lastFlow) {
      return reject({code: ERRORS.NO_FLOW});
    }

    request
      .post({
        url: BASE_PATH + `/flows/${type}`,
        qs: {
          flowId: lastFlow._id
        },
        body: {name},
        json: true
      })
      .then(res => {
        resolve({flowName: res.name});
      })
      .catch(err => {
        let reason = err;
        if (err.statusCode == 400) {
          reject({code: ERRORS.NOT_FOUND});
        }
        reject(reason);
      });
  });
}

function augmentFlow(flow) {
  flow.id = flow.id || utils.flogoIDEncode(flow._id);
  flow.url = flow.url = basePath.buildFlogoBaseUiPath(`flows/${flow.id}`);
  return flow;
}

