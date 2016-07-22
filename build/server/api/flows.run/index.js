'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flowsRun = flowsRun;

var _appConfig = require('../../config/app-config');

var _utils = require('../../common/utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _coRequest = require('co-request');

var _coRequest2 = _interopRequireDefault(_coRequest);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [getProcessFlow, restart, getSnapshot, instanceById, stepsInstance, statusInstance, flowStart, flows].map(regeneratorRuntime.mark);

var basePath = _appConfig.config.app.basePath;

function flowsRun(app, router) {
  if (!app) {
    console.error("[Error][api/flows.run/index.js]You must pass app");
  }

  router.post(basePath + '/flows/run/flows', flows);
  router.post(basePath + '/flows/run/flow/start', flowStart);
  router.get(basePath + '/flows/run/instances/:id/status', statusInstance);
  router.get(basePath + '/flows/run/instances/:id/steps', stepsInstance);
  router.get(basePath + '/flows/run/instances/:id', instanceById);
  router.get(basePath + '/flows/run/instances/:idInstance/snapshot/:idSnapshot', getSnapshot);
  router.post(basePath + '/flows/run/restart', restart);
  router.get(basePath + '/flows/run/flows/:id', getProcessFlow);
}

function getProcessFlow(next) {
  var process, id, uri, result;
  return regeneratorRuntime.wrap(function getProcessFlow$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          process = _appConfig.config.processServer;
          id = this.params.id;
          uri = getUrl(process) + '/flows/' + id;

          this.body = id;

          _context.prev = 4;
          _context.next = 7;
          return (0, _coRequest2.default)({
            uri: uri,
            method: 'GET'
          });

        case 7:
          result = _context.sent;


          this.body = result.body;
          _context.next = 14;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context['catch'](4);

          this.throw(_context.t0.message, 500);

        case 14:
          _context.next = 16;
          return next;

        case 16:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this, [[4, 11]]);
}

function restart(next) {
  var engine, data, uri, result;
  return regeneratorRuntime.wrap(function restart$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          engine = _appConfig.config.engine;
          data = this.request.body;
          uri = getUrl(engine) + '/flow/restart';
          _context2.prev = 3;
          _context2.next = 6;
          return (0, _coRequest2.default)({
            uri: uri,
            method: 'POST',
            body: data,
            json: true
          });

        case 6:
          result = _context2.sent;


          this.body = result.body;
          _context2.next = 13;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2['catch'](3);

          this.throw(_context2.t0.message, 500);

        case 13:
          _context2.next = 15;
          return next;

        case 15:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this, [[3, 10]]);
}

function getSnapshot(next) {
  var state, idInstance, idSnapshot, uri, result;
  return regeneratorRuntime.wrap(function getSnapshot$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          state = _appConfig.config.stateServer;
          idInstance = this.params.idInstance;
          idSnapshot = this.params.idSnapshot;
          uri = getUrl(state) + '/instances/' + idInstance + '/snapshot/' + idSnapshot;
          _context3.prev = 4;
          _context3.next = 7;
          return (0, _coRequest2.default)({
            uri: uri,
            method: 'GET'
          });

        case 7:
          result = _context3.sent;


          this.body = result.body;
          _context3.next = 14;
          break;

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3['catch'](4);

          this.throw(_context3.t0.message, 500);

        case 14:
          _context3.next = 16;
          return next;

        case 16:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[2], this, [[4, 11]]);
}

function instanceById(next) {
  var state, id, uri, result;
  return regeneratorRuntime.wrap(function instanceById$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          state = _appConfig.config.stateServer;
          id = this.params.id;
          uri = getUrl(state) + '/instances/' + id;
          _context4.prev = 3;
          _context4.next = 6;
          return (0, _coRequest2.default)({
            uri: uri,
            method: 'GET'
          });

        case 6:
          result = _context4.sent;


          this.body = result.body;
          _context4.next = 13;
          break;

        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4['catch'](3);

          this.throw(_context4.t0.message, 500);

        case 13:
          _context4.next = 15;
          return next;

        case 15:
        case 'end':
          return _context4.stop();
      }
    }
  }, _marked[3], this, [[3, 10]]);
}

function stepsInstance(next) {
  var state, id, uri, result;
  return regeneratorRuntime.wrap(function stepsInstance$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          state = _appConfig.config.stateServer;
          id = this.params.id;
          uri = getUrl(state) + '/instances/' + id + '/steps';

          this.body = id;

          _context5.prev = 4;
          _context5.next = 7;
          return (0, _coRequest2.default)({
            uri: uri,
            method: 'GET'
          });

        case 7:
          result = _context5.sent;


          this.body = result.body;
          _context5.next = 14;
          break;

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5['catch'](4);

          this.throw(_context5.t0.message, 500);

        case 14:
          _context5.next = 16;
          return next;

        case 16:
        case 'end':
          return _context5.stop();
      }
    }
  }, _marked[4], this, [[4, 11]]);
}

function statusInstance(next) {
  var state, id, uri, result;
  return regeneratorRuntime.wrap(function statusInstance$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          state = _appConfig.config.stateServer;
          id = this.params.id;
          uri = getUrl(state) + '/instances/' + id + '/status';

          this.body = id;

          _context6.prev = 4;
          _context6.next = 7;
          return (0, _coRequest2.default)({
            uri: uri,
            method: 'GET'
          });

        case 7:
          result = _context6.sent;


          this.body = result.body;
          _context6.next = 14;
          break;

        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6['catch'](4);

          this.throw(_context6.t0.message, 500);

        case 14:
          _context6.next = 16;
          return next;

        case 16:
        case 'end':
          return _context6.stop();
      }
    }
  }, _marked[5], this, [[4, 11]]);
}

function getUrl(service) {
  var url = service.protocol + '://' + service.host;

  if (service.port) {
    url += ':' + service.port;
  }

  return url;
}

function flowStart(next) {
  var data, engine, process, uri, result;
  return regeneratorRuntime.wrap(function flowStart$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          data = this.request.body;
          engine = _appConfig.config.engine;
          process = _appConfig.config.processServer;
          uri = getUrl(engine) + '/flow/start';

          data.flowUri = getUrl(process) + '/flows/' + data.flowId;
          delete data.flowId;

          _context7.prev = 6;
          _context7.next = 9;
          return (0, _coRequest2.default)({
            uri: uri,
            method: 'POST',
            body: data,
            json: true
          });

        case 9:
          result = _context7.sent;


          this.body = result.body;

          _context7.next = 16;
          break;

        case 13:
          _context7.prev = 13;
          _context7.t0 = _context7['catch'](6);

          this.throw(_context7.t0.message, 500);

        case 16:
          _context7.next = 18;
          return next;

        case 18:
        case 'end':
          return _context7.stop();
      }
    }
  }, _marked[6], this, [[6, 13]]);
}

function flows(next) {
  var data, process, uri, result;
  return regeneratorRuntime.wrap(function flows$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          data = this.request.body;
          process = _appConfig.config.processServer;
          uri = getUrl(process) + '/flows';
          _context8.prev = 3;
          _context8.next = 6;
          return (0, _coRequest2.default)({
            uri: uri,
            method: 'POST',
            body: data,
            json: true
          });

        case 6:
          result = _context8.sent;


          this.body = result.body;
          _context8.next = 13;
          break;

        case 10:
          _context8.prev = 10;
          _context8.t0 = _context8['catch'](3);

          this.throw(_context8.t0.message, 500);

        case 13:
          _context8.next = 15;
          return next;

        case 15:
        case 'end':
          return _context8.stop();
      }
    }
  }, _marked[7], this, [[3, 10]]);
}