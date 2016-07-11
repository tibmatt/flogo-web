'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.triggers = triggers;

var _appConfig = require('../../config/app-config');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [getTriggers].map(regeneratorRuntime.mark);

var basePath = _appConfig.config.app.basePath;

function triggers(app, router) {
  if (!app) {
    console.error("[Error][api/triggers/index.js]You must pass app");
  }
  router.get(basePath + "/triggers", getTriggers);
}

function getTriggers(next) {
  var data;
  return regeneratorRuntime.wrap(function getTriggers$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          data = [];
          _context.next = 3;
          return _appConfig.triggersDBService.allDocs({ include_docs: true }).then(function (triggers) {
            return triggers.map(function (trigger) {
              return Object.assign({}, _lodash2.default.pick(trigger, ['_id', 'name', 'title', 'version', 'description']), { title: _lodash2.default.get(trigger, 'schema.title') });
            });
          });

        case 3:
          data = _context.sent;


          this.body = data;
          _context.next = 7;
          return next;

        case 7:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}