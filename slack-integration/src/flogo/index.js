'use strict';

let Promise = require('bluebird');
let request = require('request-promise').defaults({json: true});

let ERRORS = require('./errors');
let CLIENT_ERRORS = ERRORS.CLIENT_ERRORS;
let SERVER_ERRORS = ERRORS.SERVER_ERRORS;

let utils = require('./utils');

let basePath = require('./base-path');
const BASE_PATH = basePath.buildFlogoBaseApiPath();

module.exports = {
  create,
  addTrigger,
  addActivity,
  getFlow,
  listFlows,
  listActivities,
  listTriggers,
  getLast,
  ERRORS: ERRORS.CLIENT_ERRORS
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
        flow = _augmentFlow(flow);
        state.lastCreated = Object.assign({}, flow);
        resolve(flow);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function addTrigger(triggerName) {
  return _addTile('triggers', triggerName);
}

function addActivity(activityName) {
  return _addTile('activities', activityName);
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
          flow = _augmentFlow(flows[0]);
        }
        resolve(flow);
      })
      .catch(err => {
        let reason = err;
        if (err.statusCode == 400) {
          reject({code: CLIENT_ERRORS.NOT_FOUND});
        }
        reject(reason);
      });
  });
}

function listFlows() {
  return request(BASE_PATH + '/flows')
    .then(flows => flows.map(_augmentFlow));
}

function listActivities() {
  return request(BASE_PATH + '/activities')
}

function listTriggers() {
  return request(BASE_PATH + '/triggers')
}

function getLast() {
  if (state.lastCreated) {
    return Object.assign({}, state.lastCreated);
  }
  return null;
}

/*-----------------------------------*/

function _addTile(type, name) {
  return new Promise((resolve, reject) => {

    let lastFlow = getLast();
    if(!lastFlow) {
      return reject({code: CLIENT_ERRORS.NO_FLOW});
    }

    if(!name.startsWith('tibco-')) {  // add tibco namespace if they don't have it'
      name = `tibco-${name}`;
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
          let data = err.error || {};
          reason = {flowName: lastFlow.name};
          if(data.type == SERVER_ERRORS.MISSING_TRIGGER) {
            reason.code = CLIENT_ERRORS.MISSING_TRIGGER;
          } else if (data.type == SERVER_ERRORS.FLOW_NOT_FOUND) {
            reason.code = CLIENT_ERRORS.FLOW_NOT_FOUND;
          } else {
            reason.code = CLIENT_ERRORS.NOT_FOUND;
          }
        }
        reject(reason);
      });
  });
}

function _augmentFlow(flow) {
  flow.id = flow.id || utils.flogoIDEncode(flow._id);
  flow.url = flow.url = basePath.buildFlogoBaseUiPath(`flows/${flow.id}`);
  return flow;
}

