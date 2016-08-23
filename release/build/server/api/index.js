'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.api = api;

var _activities = require('./activities');

var _triggers = require('./triggers');

var _flows = require('./flows');

var _error = require('./error');

var _flows2 = require('./flows.detail');

var _engine = require('./engine');

var _ping = require('./ping');

var _configuration = require('./configuration');

var _flows3 = require('./flows.run');

function api(app, router) {
  (0, _error.errorHandler)(app, router);
  (0, _activities.activities)(app, router);
  (0, _triggers.triggers)(app, router);
  (0, _flows.flows)(app, router);
  (0, _flows2.flowsDetail)(app, router);
  (0, _engine.engine)(app, router);
  (0, _ping.ping)(app, router);
  (0, _flows3.flowsRun)(app, router);
  (0, _configuration.configuration)(app, router);
}