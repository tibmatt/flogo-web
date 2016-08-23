'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flowsDetail = flowsDetail;

var _appConfig = require('../../config/app-config');

var _db = require('../../common/db.service');

var _flow = require('../../common/flow.model');

var _utils = require('../../common/utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [getBuild].map(regeneratorRuntime.mark);

var basePath = _appConfig.config.app.basePath;

var _dbService = _appConfig.dbService;

//TODO provide more common
function getFlatObj(arr) {
  var obj = {};
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    if (!item.name) {
      continue;
    }
    obj[item.name] = item.value;
  }

  return obj;
}

function generateTriggerJSON(doc, flowName) {
  // for now each flow just can has one trigger
  var trigger = {
    name: '',
    endpoints: null,
    settings: null
  };
  var key = _lodash2.default.findKey(doc.items, function (o) {
    return o && o.triggerType;
  });
  var triggerItem = doc.items[key];
  // For now, triggers.json just has name, settings, endpoints
  trigger.name = triggerItem.triggerType;
  var settings = triggerItem.settings;
  if (_lodash2.default.isArray(settings)) {
    trigger.settings = getFlatObj(settings);
  } else {
    trigger.settings = settings;
  }

  trigger.endpoints = [];

  var keys = _lodash2.default.keys(triggerItem.endpoint);
  var endpoint = {};
  keys.forEach(function (key) {
    if (_lodash2.default.isArray(triggerItem.endpoint[key])) {
      endpoint[key] = getFlatObj(triggerItem.endpoint[key]);
    } else {
      endpoint[key] = triggerItem.endpoint[key];
    }
  });

  // TODO this is temp solution
  endpoint.actionType = 'flow';
  endpoint.actionURI = 'embedded://' + flowName;
  endpoint.flowURI = endpoint.actionURI;

  trigger.endpoints.push(endpoint);

  console.log("[info]generateTriggerJSON, trigger: ", trigger);
  return trigger;
}

function _determineBuildExecutableNamePattern(name, compileOptions) {
  var executableName = name;
  if (compileOptions.os && compileOptions.arch) {
    executableName = executableName + '-' + compileOptions.os + '-' + compileOptions.arch;
  } else if (compileOptions.os) {
    executableName = executableName + '-' + compileOptions.os;
  } else if (compileOptions.arch) {
    executableName = executableName + '-.*-' + compileOptions.arch;
  }
  return executableName;
}

function generateBuild(id, compileOptions) {
  compileOptions = compileOptions || {};
  return new Promise(function (resolve, reject) {
    console.log('generateBuild');

    var flowID = (0, _utils.flogoIDDecode)(id);
    console.log('id: ', id);
    console.log('flowID: ', flowID);
    _dbService.db.get(flowID).then(function (doc) {
      console.log(doc);

      var flowJSON = (0, _flow.flogoFlowToJSON)(doc);
      console.log(flowJSON);

      if (_appConfig.engines.build) {
        (function () {
          console.log("build engine, build.enginePath", _appConfig.engines.build.enginePath);
          var engineFolderPath = _path2.default.join(_appConfig.engines.build.enginePath, _appConfig.engines.build.options.name);

          // step1: add flow.json
          var tmpFlowJSONPath = _path2.default.join(_appConfig.config.rootPath, 'tmp', 'flow.json');
          _fsExtra2.default.outputJSONSync(tmpFlowJSONPath, flowJSON.flow);
          _appConfig.engines.build.deleteAllFlows();
          var flowName = _appConfig.engines.build.addFlow('file://' + tmpFlowJSONPath);
          // step2: update config.json
          _appConfig.engines.build.updateConfigJSON(_appConfig.config.buildEngine.config, true);
          // step3: update trigger.json
          var triggerJSON = generateTriggerJSON(doc, flowName);

          var triggersJSON = {
            "triggers": []
          };
          triggersJSON.triggers.push(triggerJSON);
          _appConfig.engines.build.updateTriggerJSON(triggersJSON, true);

          // step4: build
          _appConfig.engines.build.build({
            optimize: true,
            incorporateConfig: true,
            compile: compileOptions
          }).then(function () {
            // setp 5: return file
            var binPath = _path2.default.join(engineFolderPath, 'bin');
            var executableName = _determineBuildExecutableNamePattern(_appConfig.engines.build.options.name, compileOptions);
            console.log('[log] execName: ' + executableName);
            // if no compile options provided or both options provided we can skip the search for generated binary since we have the exact name
            var isDefaultCompile = !compileOptions.os && !compileOptions.arch;
            if (isDefaultCompile || compileOptions.os && compileOptions.arch) {
              console.log('[debug] Default compile, grab file directly');
              var data = _fs2.default.readFileSync(_path2.default.join(binPath, executableName));
              return resolve(data);
            } else {
              console.log('[debug] Find file');
              return (0, _utils.findLastCreatedFile)(binPath, new RegExp(executableName)).then(function (buildEnginePath) {
                console.log('[log] Found: ' + JSON.stringify(buildEnginePath));
                var data = _fs2.default.readFileSync(buildEnginePath);
                resolve(data);
              });
            }
          }).catch(reject);
        })();
      } else {
        reject(err);
      }
    }).catch(function (err) {
      reject(err);
    });
  });
}

function flowsDetail(app, router) {
  if (!app) {
    console.error("[Error][api/flows.detail/index.js]You must pass app");
  }
  router.get(basePath + "/flows/:id/build", getBuild);
}

function getBuild(next) {
  var id, compileOptions, data;
  return regeneratorRuntime.wrap(function getBuild$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:

          console.log("getBuild");

          //let engineDirPath = path.resolve(config.rootPath, config.testEngine.path);
          //engineDirPath = path.join(engineDirPath, config.testEngine.name);
          //let engineFilePath = path.join(engineDirPath, 'bin', config.testEngine.name);
          //
          //let data = fs.readFileSync(engineFilePath);

          //console.log("data: ", data);
          id = this.params.id;
          compileOptions = void 0;
          // TODO: make sure os and arch are valid

          if (this.query.os || this.query.arch) {
            compileOptions = {
              os: this.query.os,
              arch: this.query.arch
            };
          }

          _context.next = 6;
          return generateBuild(id, compileOptions);

        case 6:
          data = _context.sent;


          //data = yield _dbService.allDocs({ include_docs: true })
          //  .then(res => res.rows || [])
          //  .then(rows => rows.map(row => row.doc ? _.pick(row.doc, ['_id', 'name', 'version', 'description']) : []));
          //
          //console.log(data);
          this.body = data;
          _context.next = 10;
          return next;

        case 10:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}