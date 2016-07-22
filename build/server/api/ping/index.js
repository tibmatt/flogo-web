'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ping = ping;

var _appConfig = require('../../config/app-config');

var _utils = require('../../common/utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _coRequest = require('co-request');

var _coRequest2 = _interopRequireDefault(_coRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [pingService].map(regeneratorRuntime.mark);

var basePath = _appConfig.config.app.basePath;

var services = [];
services['engine'] = _appConfig.config.engine;
services['stateServer'] = _appConfig.config.stateServer;
services['flowServer'] = _appConfig.config.processServer;
services['flogo-web'] = _appConfig.config.flogoWeb;
services['flogo-web-activities'] = _appConfig.config.flogoWebActivities;
services['flogo-web-triggers'] = _appConfig.config.flogoWebTriggers;

function ping(app, router) {
  if (!app) {
    console.error("[Error][api/ping/index.js]You must pass app");
  }

  router.post(basePath + "/ping/service", pingService);

  //router.get(basePath+"/ping/configuration", pingConfiguration);
}

/*
function* pingConfiguration(next) {
  this.body = {
    engine: config.engine,
    stateServer:  config.stateServer,
    flowServer: config.processServer,
    webServer: config.webServer,
    db: config.flogoWeb,
    activities: config.flogoWebActivities,
    triggers: config.flogoWebTriggers
  };
  yield next;
}
*/

function pingService(next) {
  var data, service, protocol, host, port, testPath, url, result;
  return regeneratorRuntime.wrap(function pingService$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          data = this.request.body.config || {};

          if (typeof this.request.body == 'string') {
            if ((0, _utils.isJSON)(this.request.body)) {
              data = JSON.parse(this.request.body);
            }
          }

          service = services[data.name];

          if (!(typeof service == 'undefined')) {
            _context.next = 7;
            break;
          }

          console.log(data);
          throw new Error('Wrong service name in pingService');

        case 7:
          protocol = data.protocol || service.protocol;
          host = data.host || service.host;
          port = data.port || service.port;
          testPath = data.testPath || service.testPath;
          url = protocol + '://' + host + ':' + port + '/' + testPath;
          _context.next = 14;
          return (0, _coRequest2.default)(url);

        case 14:
          result = _context.sent;

          if (!(result.statusCode && result.statusCode != 200)) {
            _context.next = 17;
            break;
          }

          throw new Error('Error');

        case 17:
          this.body = result.body;
          _context.next = 23;
          break;

        case 20:
          _context.prev = 20;
          _context.t0 = _context['catch'](0);

          this.throw(_context.t0.message, 500);

        case 23:
          _context.next = 25;
          return next;

        case 25:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this, [[0, 20]]);
}