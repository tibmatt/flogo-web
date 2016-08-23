'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.engine = engine;

var _appConfig = require('../../config/app-config');

var _engine = require('../../modules/engine');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [restartEngine].map(regeneratorRuntime.mark);

var basePath = _appConfig.config.app.basePath;

function engine(app, router) {
  if (!app) {
    console.error("[Error][api/engine/index.js]You must pass app");
  }
  router.get(basePath + "/engine/restart", restartEngine);
}

function restartEngine(next) {
  var data, name, testEngine, stopTestEngineResult, startTestEngineResult;
  return regeneratorRuntime.wrap(function restartEngine$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('Restart Engine');
          data = {
            status: 200
          };
          _context.prev = 2;
          name = this.query && this.query.name ? this.query && this.query.name : "test";
          _context.next = 6;
          return (0, _engine.getInitialisedTestEngine)();

        case 6:
          testEngine = _context.sent;

          if (!(name == "build")) {
            _context.next = 11;
            break;
          }

          _context.next = 10;
          return (0, _engine.getInitialisedBuildEngine)();

        case 10:
          testEngine = _context.sent;

        case 11:
          _context.next = 13;
          return testEngine.stop();

        case 13:
          stopTestEngineResult = _context.sent;
          startTestEngineResult = false;

          if (!stopTestEngineResult) {
            _context.next = 21;
            break;
          }

          _context.next = 18;
          return testEngine.start();

        case 18:
          startTestEngineResult = _context.sent;
          _context.next = 23;
          break;

        case 21:
          data.status = 500;
          console.log("[error] didn't stop successful");

        case 23:

          if (!startTestEngineResult) {
            data.status = 500;
            console.log("[error] didn't start successful");
          }

          this.body = data;
          _context.next = 27;
          return next;

        case 27:
          _context.next = 36;
          break;

        case 29:
          _context.prev = 29;
          _context.t0 = _context['catch'](2);

          console.log("[error][restartEngine]: ", _context.t0);
          data.status = 500;
          this.body = data;
          _context.next = 36;
          return next;

        case 36:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this, [[2, 29]]);
}