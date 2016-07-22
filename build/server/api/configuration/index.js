'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configuration = configuration;

var _appConfig = require('../../config/app-config');

var _utils = require('../../common/utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _coRequest = require('co-request');

var _coRequest2 = _interopRequireDefault(_coRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [getConfiguration, reset, setConfiguration].map(regeneratorRuntime.mark);

var basePath = _appConfig.config.app.basePath;

function configuration(app, router) {
  if (!app) {
    console.error("[Error][api/ping/index.js]You must pass app");
  }

  router.post(basePath + "/configuration/", setConfiguration);
  router.get(basePath + "/configuration/reset", reset);
  router.get(basePath + "/configuration", getConfiguration);
}

function getConfiguration(next) {
  return regeneratorRuntime.wrap(function getConfiguration$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          this.body = {
            engine: _appConfig.config.engine,
            stateServer: _appConfig.config.stateServer,
            flowServer: _appConfig.config.processServer,
            webServer: _appConfig.config.webServer,
            db: _appConfig.config.flogoWeb,
            activities: _appConfig.config.flogoWebActivities,
            triggers: _appConfig.config.flogoWebTriggers
          };
          _context.next = 3;
          return next;

        case 3:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function reset(next) {
  return regeneratorRuntime.wrap(function reset$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:

          try {
            (0, _appConfig.resetConfiguration)();
            this.body = _appConfig.config;
          } catch (err) {
            this.throw(err.message, 500);
          }

          _context2.next = 3;
          return next;

        case 3:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

function setConfiguration(next) {
  var data;
  return regeneratorRuntime.wrap(function setConfiguration$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:

          try {
            data = this.request.body.configuration || {};


            if (typeof this.request.body == 'string') {
              if ((0, _utils.isJSON)(this.request.body.configuration)) {
                data = JSON.parse(this.request.body.configuration);
              }
            }

            console.log('The new configuration is:');
            console.log(data);
            (0, _appConfig.setConfiguration)(data);

            this.body = _appConfig.config;
          } catch (err) {
            this.throw(err.message, 500);
          }

          _context3.next = 3;
          return next;

        case 3:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[2], this);
}