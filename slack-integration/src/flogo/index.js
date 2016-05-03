'use strict';

let Promise = require('bluebird');
let request = require('request-promise').defaults({json: true});

let ERRORS = require('./errors');

let utils = require('./utils');

const BASE_PATH = require('./base-path')();

module.exports = {
  create,
  addTrigger,
  addActivity,
  getFlow,
  listFlows,
  getLast,
  ERRORS
};

const TRIGGERS = ['rest', 'mqtt'];
const ACTIVITIES = ['sms', 'rest', 'log'];

let state = {
  lastCreated: null,
  flows: []
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
        flow.id = utils.flogoIDEncode(flow.id);
        flow.name = flow.name || flowName;
        resolve(flow);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function addTrigger(triggerName) {
  return new Promise((resolve, reject) => {
    if (state.lastCreated) {
      if (triggerName && TRIGGERS.indexOf(triggerName.toLowerCase()) >= 0) {
        resolve({
          flowName: state.lastCreated.name
        });
      } else {
        reject({code: ERRORS.NOT_FOUND});
      }
    } else {
      reject({code: ERRORS.NO_FLOW});
    }
  });
}

function addActivity(activityName) {
  return new Promise((resolve, reject) => {
    if (state.lastCreated) {
      if (activityName && ACTIVITIES.indexOf(activityName.toLowerCase()) >= 0) {
        resolve({
          flowName: state.lastCreated.name
        });
      } else {
        reject({code: ERRORS.NOT_FOUND});
      }
    } else {
      reject({code: ERRORS.NO_FLOW});
    }
  });
}

function getFlow(flowName) {
  return Promise.resolve(state.flows.find(flow => flow.name == flowName));
}

function listFlows() {
  return request(BASE_PATH + '/flows');
}

function getLast() {
  if (state.lastCreated) {
    return Object.assign({}, state.lastCreated);
  }
  return null;
}

function _createFlow(flowName) {
  let id = 1;
  if (state.lastCreated) {
    id = state.lastCreated.id + 1;
  }

  return {
    id,
    name: flowName,
    description: null,
    created: new Date()
  };

}

