'use strict';

require('babel-polyfill');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _koaBody = require('koa-body');

var _koaBody2 = _interopRequireDefault(_koaBody);

var _koaCompress = require('koa-compress');

var _koaCompress2 = _interopRequireDefault(_koaCompress);

var _utils = require('./common/utils');

var _appConfig = require('./config/app-config');

var _api = require('./api');

var _engine = require('./modules/engine');

var _init = require('./modules/init');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = require('koa-router')();


// TODO Need to use cluster to improve the performance

var app = void 0;

/**
 * Server start logic
 *
 * 1. register default activities and triggers.
 * 2. initialise the default engine (the test engine) and build engine.
 * 3. start the test engine.
 * 4. configure the server and start listening
 */

var startConfig = Promise.resolve(true);
if (process.env['FLOGO_NO_ENGINE_RECREATION']) {
  startConfig = startConfig.then(function () {
    return _appConfig.triggersDBService.verifyInitialDataLoad(_path2.default.resolve('db-init/installed-triggers.init'));
  }).then(function () {
    return _appConfig.activitiesDBService.verifyInitialDataLoad(_path2.default.resolve('db-init/installed-activities.init'));
  }).then(function () {
    return (0, _init.loadTasksToEngines)();
  });
} else {
  startConfig = startConfig.then(_init.installAndConfigureTasks);
}

startConfig.then(function () {
  return (0, _engine.getInitialisedTestEngine)();
}).then(function (testEngine) {
  console.log('############ TEST ENGINE ####################');
  console.log('~~~ ACTIVITIES ~~~');
  console.log(testEngine.installedActivites);
  console.log('~~~ Triggers ~~~');
  console.log(testEngine.installedTriggers);
  return testEngine.build().then(function () {
    console.log("[log] build test engine done.");
    return testEngine.start();
  });
}).then(function () {
  console.log("[log] start test engine done");
  return (0, _engine.getInitialisedBuildEngine)();
}).then(function (buildEngine) {
  console.log('############ BUILD ENGINE ####################');
  console.log('~~~ ACTIVITIES ~~~');
  console.log(buildEngine.installedActivites);
  console.log('~~~ Triggers ~~~');
  console.log(buildEngine.installedTriggers);
  console.log('[log] start web server...');
  return initServer();
}).catch(function (err) {
  console.log(err);
  throw err;
});

function initServer() {

  return new Promise(function (resolve, reject) {

    app = (0, _koa2.default)();

    var port = _appConfig.config.app.port;

    (0, _api.api)(app, router);

    // make sure deep link it works
    app.use(regeneratorRuntime.mark(function _callee(next) {
      var path;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              path = this.path.endsWith('/') ? this.path.substring(0, this.path.length - 1) : this.path;

              // not include restful api

              if (!/\/[^\/]+\.[^.\/]+$/i.test(path) && path.toLowerCase().search('/api/') === -1) {
                this.path = '/';
              }
              _context.next = 4;
              return next;

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    // compress
    app.use((0, _koaCompress2.default)({
      filter: function filter(content_type) {
        return (/text/i.test(content_type)
        );
      },
      threshold: 2048,
      flush: require('zlib').Z_SYNC_FLUSH
    }));

    // server static resources
    app.use((0, _koaStatic2.default)(_appConfig.config.publicPath, { maxage: _appConfig.config.app.cacheTime }));
    app.use((0, _koaBody2.default)({ multipart: true }));

    app.on('error', function (err) {
      if (401 == err.status) {
        return;
      }
      if (404 == err.status) {
        return;
      }

      console.error(err.toString());
      reject(err);
    });

    app.use(router.routes());

    // logger
    app.use(regeneratorRuntime.mark(function _callee2(next) {
      var start, ms;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              start = new Date();
              _context2.next = 3;
              return next;

            case 3:
              ms = new Date() - start;

              console.log('%s %s - %s', this.method, this.url, ms);
              console.log(this.body);
              console.log(this.request.body);

            case 7:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    app.listen(port, function () {
      console.log('[log] start web server done.');
      showInitBanner();
      resolve(app);
    });
  });
}

function showInitBanner() {
  console.log("=============================================================================================");
  console.log("[success] open http://localhost:3010 or http://localhost:3010/_config in your browser");
  console.log("=============================================================================================");
}