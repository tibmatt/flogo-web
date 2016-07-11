'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorHandler = errorHandler;

var _appConfig = require('../../config/app-config');

var basePath = _appConfig.config.app.basePath;

function errorHandler(app, router) {

  router.use(basePath, regeneratorRuntime.mark(function _callee(next) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return next;

          case 3:
            _context.next = 8;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context['catch'](0);

            if (_context.t0.status == 400 && _context.t0.details) {
              // Set our response.
              this.status = _context.t0.status;
              this.body = _context.t0.details;
            } else {
              // rethrow
              this.throw(_context.t0);
            }

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 5]]);
  }));
}