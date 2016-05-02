'use strict';

let Promise = require('bluebird');
let request = require('request-promise').defaults({json: true});

let ERRORS = require('./errors');

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
        body: JSON.stringify({name: flowName}),
        json: false,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });


    /*
    let exists = state.flows.find(flow => flow.name == flowName);
    if (exists) {
      return reject({code: ERRORS.ALREADY_EXISTS});
    }

    let flow = _createFlow(flowName);
    state.flows.push(flow);
    state.lastCreated = flow;

    return resolve(flow);*/
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
  if(state.lastCreated) {
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

