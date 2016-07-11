'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activities = activities;

var _appConfig = require('../../config/app-config');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [getActivities, installActivities, deleteActivities].map(regeneratorRuntime.mark);

var basePath = _appConfig.config.app.basePath;

function activities(app, router) {
  if (!app) {
    console.error("[Error][api/activities/index.js]You must pass app");
  }

  router.get(basePath + "/activities", getActivities);
  router.post(basePath + "/activities", installActivities);
  router.delete(basePath + "/activities", deleteActivities);
}

function getActivities(next) {
  var data;
  return regeneratorRuntime.wrap(function getActivities$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return _appConfig.activitiesDBService.allDocs({ include_docs: true }).then(function (activities) {
            return activities.map(function (activity) {
              return Object.assign({}, _lodash2.default.pick(activity, ['_id', 'name', 'title', 'version', 'description']), { title: _lodash2.default.get(activity, 'schema.title') });
            });
          });

        case 2:
          data = _context.sent;


          this.body = data;
          _context.next = 6;
          return next;

        case 6:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function installActivities(next) {
  return regeneratorRuntime.wrap(function installActivities$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log("installActivities");
          this.body = 'installActivities';
          _context2.next = 4;
          return next;

        case 4:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

function deleteActivities(next) {
  return regeneratorRuntime.wrap(function deleteActivities$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log("deleteActivities");
          this.body = 'deleteActivities';
          _context3.next = 4;
          return next;

        case 4:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[2], this);
}