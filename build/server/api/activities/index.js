'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activities = activities;

var _appConfig = require('../../config/app-config');

var _constants = require('../../common/constants');

var _utils = require('../../common/utils');

var _engine = require('../../modules/engine');

var _remoteInstaller = require('../../modules/remote-installer');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [getActivities, installActivities, deleteActivities].map(regeneratorRuntime.mark);

var basePath = _appConfig.config.app.basePath;

var remoteInstaller = new _remoteInstaller.RemoteInstaller({
  type: _constants.TYPE_ACTIVITY,
  registerPath: _path2.default.join(_appConfig.config.rootPath, _constants.DEFAULT_PATH_ACTIVITY)
});

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
  var _this = this;

  var urls, results, testEngine, stopTestEngineResult, addActivitiesResult, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, testEngineBuildResult, testEngineStartResult;

  return regeneratorRuntime.wrap(function installActivities$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          urls = preProcessURLs(this.request.body.urls);

          console.log('[log] Install Activities');
          (0, _utils.inspectObj)(urls);
          _context3.next = 5;
          return remoteInstaller.install(urls);

        case 5:
          results = _context3.sent;

          console.log('[log] Installation results');
          (0, _utils.inspectObj)({
            success: results.success,
            fail: results.fail
          });

          _context3.next = 10;
          return (0, _engine.getInitialisedTestEngine)();

        case 10:
          testEngine = _context3.sent;

          if (!testEngine) {
            _context3.next = 62;
            break;
          }

          console.log('[log] adding activities to test engine...');

          _context3.next = 15;
          return testEngine.stop();

        case 15:
          stopTestEngineResult = _context3.sent;

          if (stopTestEngineResult) {
            _context3.next = 18;
            break;
          }

          throw new Error('[error] Encounter error to stop test engine.');

        case 18:
          _context3.prev = 18;
          addActivitiesResult = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context3.prev = 23;
          _loop = regeneratorRuntime.mark(function _loop() {
            var successItemURL, item, itemInfoToInstall, addActivityResult;
            return regeneratorRuntime.wrap(function _loop$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    successItemURL = _step.value;


                    console.log('[log] adding ' + successItemURL + ' to test engine ...');
                    item = results.details[successItemURL];
                    itemInfoToInstall = {
                      name: item.schema.name || item.package.name,
                      path: item.path,
                      version: item.package.version || item.schema.version
                    };


                    (0, _utils.inspectObj)(itemInfoToInstall);

                    _context2.next = 7;
                    return new Promise(function (resolve, reject) {

                      var addOnError = function addOnError(err) {
                        // if error happens, just note it down and report adding activity failed.
                        console.log('[error] failed to add activity ' + itemInfoToInstall.name + ' [' + itemInfoToInstall.path + ']');
                        console.log(err);
                        resolve(false);
                      };

                      var hasActivity = testEngine.hasActivity(itemInfoToInstall.name, itemInfoToInstall.path);

                      (0, _utils.inspectObj)(hasActivity);

                      if (hasActivity.exists) {
                        if (hasActivity.samePath && hasActivity.version && itemInfoToInstall.version && _semver2.default.lte(itemInfoToInstall.version, hasActivity.version)) {
                          console.log('[log] skip adding exists activity ' + itemInfoToInstall.name + ' (' + itemInfoToInstall.version + ') [' + itemInfoToInstall.path + ']');
                          resolve(true);
                        } else {
                          // else delete the activity before install
                          return testEngine.deleteActivity(itemInfoToInstall.name).then(function () {
                            return testEngine.addActivity(itemInfoToInstall.name, itemInfoToInstall.path, itemInfoToInstall.version);
                          }).then(function () {
                            resolve(true);
                          }).catch(addOnError);
                        }
                      } else {
                        return testEngine.addActivity(itemInfoToInstall.name, itemInfoToInstall.path, itemInfoToInstall.version).then(function () {
                          resolve(true);
                        }).catch(addOnError);
                      }
                    });

                  case 7:
                    addActivityResult = _context2.sent;


                    addActivitiesResult.push(addActivityResult);

                  case 9:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _loop, _this);
          });
          _iterator = results.success[Symbol.iterator]();

        case 26:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context3.next = 31;
            break;
          }

          return _context3.delegateYield(_loop(), 't0', 28);

        case 28:
          _iteratorNormalCompletion = true;
          _context3.next = 26;
          break;

        case 31:
          _context3.next = 37;
          break;

        case 33:
          _context3.prev = 33;
          _context3.t1 = _context3['catch'](23);
          _didIteratorError = true;
          _iteratorError = _context3.t1;

        case 37:
          _context3.prev = 37;
          _context3.prev = 38;

          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }

        case 40:
          _context3.prev = 40;

          if (!_didIteratorError) {
            _context3.next = 43;
            break;
          }

          throw _iteratorError;

        case 43:
          return _context3.finish(40);

        case 44:
          return _context3.finish(37);

        case 45:
          _context3.next = 52;
          break;

        case 47:
          _context3.prev = 47;
          _context3.t2 = _context3['catch'](18);

          console.error('[error] add activities to test engine');
          console.error(_context3.t2);
          throw new Error('[error] Encounter error to add activities to test engine.');

        case 52:
          _context3.next = 54;
          return testEngine.build();

        case 54:
          testEngineBuildResult = _context3.sent;

          if (testEngineBuildResult) {
            _context3.next = 57;
            break;
          }

          throw new Error('[error] Encounter error to build test engine after adding activities.');

        case 57:
          _context3.next = 59;
          return testEngine.start();

        case 59:
          testEngineStartResult = _context3.sent;

          if (testEngineStartResult) {
            _context3.next = 62;
            break;
          }

          throw new Error('[error] Encounter error to start test engine after adding activities.');

        case 62:

          delete results.details; // keep the details internally.

          this.body = results;

          _context3.next = 66;
          return next;

        case 66:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[1], this, [[18, 47], [23, 33, 37, 45], [38,, 40, 44]]);
}

function deleteActivities(next) {
  return regeneratorRuntime.wrap(function deleteActivities$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          console.log('------- ------- -------');
          console.log('Delete Activities');
          console.log(this.request.body.urls);
          this.body = 'TODO';
          console.log('------- ------- -------');

          _context4.next = 7;
          return next;

        case 7:
        case 'end':
          return _context4.stop();
      }
    }
  }, _marked[2], this);
}

function preProcessURLs(urls) {
  'use strict';
  // TODO

  return urls;
}