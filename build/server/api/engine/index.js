'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.engine = engine;

var _appConfig = require('../../config/app-config');

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
  var data, name, testEngine;
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
          testEngine = _appConfig.engines.test;


          if (name == "build") {
            testEngine = _appConfig.engines.build;
          }

          if (testEngine.stop()) {
            if (!testEngine.start()) {
              data.status = 500;

              console.log("didn't start successful");
            }
          } else {
            data.status = 500;
            console.log("didn't stop successful");
          }

          this.body = data;
          _context.next = 10;
          return next;

        case 10:
          _context.next = 19;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context['catch'](2);

          console.log("[error][restartEngine]: ", _context.t0);
          data.status = 500;
          this.body = data;
          _context.next = 19;
          return next;

        case 19:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this, [[2, 12]]);
}