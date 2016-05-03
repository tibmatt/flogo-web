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
    request
      .post({
        url: BASE_PATH + '/flows/triggers',
        body: JSON.stringify({name: triggerName}),
        json: false,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
      .then(res => {
        resolve(true);
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

function addActivity(activityName) {
  return new Promise((resolve, reject) => {
    request
      .post({
        url: BASE_PATH + '/flows/activities',
        body: JSON.stringify({name: activityName}),
        json: false,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
      .then(res => {
        resolve(true);
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
          flow = flows[0];
          flow.id = utils.flogoIDEncode(flow.id || flow._id);
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
  return request(BASE_PATH + '/flows');
}

function getLast() {
  if (state.lastCreated) {
    return Object.assign({}, state.lastCreated);
  }
  return null;
}


