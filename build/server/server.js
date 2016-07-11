'use strict';

require('babel-polyfill');

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _koaBody = require('koa-body');

var _koaBody2 = _interopRequireDefault(_koaBody);

var _koaCompress = require('koa-compress');

var _koaCompress2 = _interopRequireDefault(_koaCompress);

var _appConfig = require('./config/app-config');

var _api = require('./api');

var _activities = require('./modules/activities');

var _triggers = require('./modules/triggers');

var _engine = require('./modules/engine');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = require('koa-router')();


// TODO Need to use cluster to improve the performance

var app = (0, _koa2.default)();
var port = _appConfig.config.app.port;

(0, _api.api)(app, router);

if (!process.env['FLOGO_SKIP_PKG_INSTALL']) {
  (function () {
    var testEngine = new _engine.Engine({
      name: _appConfig.config.testEngine.name,
      path: _appConfig.config.testEngine.path,
      port: _appConfig.config.testEngine.port
    });

    var buildEngine = new _engine.Engine({
      name: _appConfig.config.buildEngine.name,
      path: _appConfig.config.buildEngine.path,
      port: _appConfig.config.buildEngine.port
    });

    var registerActivities = new _activities.RegisterActivities(_appConfig.activitiesDBService, {
      defaultPath: _path2.default.resolve(_appConfig.config.rootPath, _appConfig.config.activities.defaultPath),
      defaultConfig: _appConfig.config.activities.default,
      customPath: _path2.default.resolve(_appConfig.config.rootPath, _appConfig.config.activities.contribPath),
      customConfig: _appConfig.config.activities.contrib
    });

    var registerTriggers = new _triggers.RegisterTriggers(_appConfig.triggersDBService, {
      defaultPath: _path2.default.resolve(_appConfig.config.rootPath, _appConfig.config.triggers.defaultPath),
      defaultConfig: _appConfig.config.triggers.default,
      customPath: _path2.default.resolve(_appConfig.config.rootPath, _appConfig.config.triggers.contribPath),
      customConfig: _appConfig.config.triggers.contrib
    });

    //
    var PromiseAll = [];
    var activityPromise = new Promise(function (resolve, reject) {
      registerActivities.register().then(function () {
        console.log("[success]registerActivities success");
        resolve(true);
      }).catch(function (err) {
        console.log("[error]registerActivities error");
        reject(err);
      });
    });

    PromiseAll.push(activityPromise);

    var triggerPromise = new Promise(function (resolve, reject) {
      registerTriggers.register().then(function () {
        console.log("[success]registerTriggers success");
        resolve(true);
      }).catch(function (err) {
        console.log("[error]registerTriggers error");
        reject(err);
      });
    });

    PromiseAll.push(triggerPromise);

    Promise.all(PromiseAll).then(function () {
      testEngine.addAllActivities().then(function () {
        return testEngine.addAllTriggers(_appConfig.config.testEngine.installConfig);
      }).then(function () {
        // update config.json, use overwrite mode
        testEngine.updateConfigJSON(_appConfig.config.testEngine.config, true);
        // update triggers.json
        testEngine.updateTriggerJSON({
          "triggers": _appConfig.config.testEngine.triggers
        });
        testEngine.build();
        //console.log("[info] finish build");
        testEngine.start();
        //console.log("[info] finish start");
        buildEngine.addAllActivities().then(function () {
          buildEngine.addAllTriggers(_appConfig.config.buildEngine.installConfig).then(function () {
            _appConfig.engines.build = buildEngine;
            _appConfig.engines.test = testEngine;
            showInitBanner();
          });
        });
      }).catch(function (err) {});
    }).catch(function (err) {
      console.log(err);
    });
  })();
} else {
  showInitBanner();
}

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
app.use((0, _koaStatic2.default)("../public", { maxage: _appConfig.config.app.cacheTime }));
app.use((0, _koaBody2.default)({ multipart: true }));

app.on('error', function (err) {
  if (401 == err.status) return;
  if (404 == err.status) return;

  console.error(err.toString());
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

function showInitBanner() {
  console.log("=============================================================================================");
  console.log("[success] open http://localhost:3010 or http://localhost:3010/_config in your browser");
  console.log("=============================================================================================");
}

app.listen(port);