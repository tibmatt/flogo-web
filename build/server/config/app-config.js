'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flowExport = exports.engines = exports.dbService = exports.activitiesDBService = exports.triggersDBService = exports.originalConfig = exports.config = undefined;
exports.setConfiguration = setConfiguration;
exports.resetConfiguration = resetConfiguration;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('../common/utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _db = require('../common/db.service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rootPath = _path2.default.normalize(__dirname + '/..');

var publicPath = _path2.default.normalize(rootPath + '/../public');

var FLOW_SERVICE_HOST = process.env.FLOGO_FLOW_SERVICE_HOST || "localhost";
var FLOW_STATE_SERVICE_HOST = process.env.FLOGO_FLOW_STATE_SERVICE_HOST || "localhost";
var FLOW_WEB_HOST = (0, _utils.extractDomain)(process.env.FLOGO_FLOW_WEB_HOST || "localhost");

console.log("rootPath: ", rootPath);
console.log("publicPath: ", publicPath);

var config = {
  db: 'http://localhost:5984/flogo-web',
  rootPath: rootPath,
  publicPath: publicPath,
  app: {
    basePath: '/v1/api',
    port: process.env.PORT || 3010,
    cacheTime: 0, //7 * 24 * 60 * 60 * 1000 /* default caching time (7 days) for static files, calculated in milliseconds */
    gitRepoCachePath: _path2.default.join(rootPath, 'git-cache')
  },
  activities: {
    db: "http://localhost:5984/flogo-web-activities",
    defaultPath: "../../submodules/flogo-contrib/activity",
    contribPath: "../../contrib/activity",
    default: {
      "tibco-twilio": {
        path: "github.com/TIBCOSoftware/flogo-contrib/activity/twilio"
      },
      "tibco-coap": {
        path: "github.com/TIBCOSoftware/flogo-contrib/activity/coap"
      },
      "tibco-awsiot": {
        path: "github.com/TIBCOSoftware/flogo-contrib/activity/awsiot"
      },
      "tibco-rest": {
        path: "github.com/TIBCOSoftware/flogo-contrib/activity/rest"
      },
      "sendWSMessage": {
        path: "github.com/TIBCOSoftware/flogo-contrib/activity/wsmessage"
      }
    },
    contrib: {}
  },
  triggers: {
    db: "http://localhost:5984/flogo-web-triggers",
    defaultPath: "../../submodules/flogo-contrib/trigger",
    contribPath: "../../contrib/trigger",
    default: {
      "tibco-mqtt": {
        path: "github.com/TIBCOSoftware/flogo-contrib/trigger/mqtt"
      },
      "tibco-timer": {
        path: "github.com/TIBCOSoftware/flogo-contrib/trigger/timer"
      },
      "tibco-coap": {
        path: "github.com/TIBCOSoftware/flogo-contrib/trigger/coap"
      },
      "tibco-rest": {
        path: "github.com/TIBCOSoftware/flogo-contrib/trigger/rest"
      }
    }
  },
  models: {
    db: "http://localhost:5984/flogo-web-models",
    defaultPath: "../../submodules/flogo-contrib/model",
    contribPath: "../../contrib/model"
  },
  testEngine: {
    path: "./",
    name: "test-engine",
    port: "8080",
    installConfig: {
      "tibco-mqtt": {
        ignore: true
      },
      "tibco-timer": {
        ignore: true
      },
      "tibco-coap": {
        ignore: true
      }
    },
    triggers: [{
      "name": "tibco-mqtt",
      "settings": {
        "topic": "flogo/#",
        "broker": "tcp://192.168.1.12:1883",
        "id": "flogoEngine",
        "user": "",
        "password": "",
        "store": "",
        "qos": "0",
        "cleansess": "false"
      },
      "endpoints": null
    }, {
      "name": "tibco-rest",
      "settings": {
        "port": "9990"
      },
      "endpoints": null
    }, {
      "name": "tibco-timer",
      "settings": {},
      "endpoints": null
    }],
    config: {
      "loglevel": "DEBUG",
      "flowRunner": {
        "type": "pooled",
        "pooled": {
          "numWorkers": 5,
          "workQueueSize": 50,
          "maxStepCount": 32000
        }
      },
      "services": [{
        "name": "stateRecorder",
        "enabled": true,
        "settings": {
          "host": FLOW_STATE_SERVICE_HOST,
          "port": "9190"
        }
      }, {
        "name": "flowProvider",
        "enabled": true,
        "settings": {
          "host": FLOW_SERVICE_HOST,
          "port": "9090"
        }
      }, {
        "name": "engineTester",
        "enabled": true,
        "settings": {
          "port": "8080"
        }
      }]
    }
  },
  buildEngine: {
    host: "localhost",
    port: "8081",
    path: "./",
    name: "build-engine",
    installConfig: {},
    config: {
      "loglevel": "DEBUG",
      "flowRunner": {
        "type": "pooled",
        "pooled": {
          "numWorkers": 5,
          "workQueueSize": 50,
          "maxStepCount": 32000
        }
      },
      "services": [{
        "name": "stateRecorder",
        "enabled": false,
        "settings": {
          "host": "localhost",
          "port": "9190"
        }
      }, {
        "name": "flowProvider",
        "enabled": true
      }, {
        "name": "engineTester",
        "enabled": true,
        "settings": {
          "port": "8081"
        }
      }]
    }
  },
  flogoWeb: {
    protocol: 'http',
    host: FLOW_WEB_HOST,
    port: "5984",
    testPath: "flogo-web",
    label: 'Application database'
  },
  flogoWebActivities: {
    protocol: 'http',
    host: FLOW_WEB_HOST,
    port: "5984",
    testPath: "flogo-web-activities",
    label: 'Activities'
  },
  flogoWebTriggers: {
    protocol: 'http',
    host: FLOW_WEB_HOST,
    port: "5984",
    testPath: "flogo-web-triggers",
    label: 'Triggers'
  },
  stateServer: {
    protocol: 'http',
    host: FLOW_STATE_SERVICE_HOST,
    port: "9190",
    testPath: "ping"
  },
  processServer: {
    protocol: 'http',
    host: FLOW_SERVICE_HOST,
    port: "9090",
    testPath: "ping"
  },
  webServer: {
    protocol: 'http',
    host: FLOW_WEB_HOST,
    port: "3010",
    testPath: ''
  },
  engine: {
    protocol: 'http',
    host: 'localhost',
    port: "8080",
    testPath: "status"
  }
};

var originalConfig = _lodash2.default.cloneDeep(config);

exports.config = config;
exports.originalConfig = originalConfig;


var triggersDBService = new _db.DBService(config.triggers.db);
var activitiesDBService = new _db.DBService(config.activities.db);
var dbService = new _db.DBService(config.db);

var engines = {
  "test": undefined,
  "build": undefined
};

exports.triggersDBService = triggersDBService;
exports.activitiesDBService = activitiesDBService;
exports.dbService = dbService;
exports.engines = engines;
var flowExport = exports.flowExport = {
  filename: 'flogo.export.json'
};

function setConfiguration(newSettings) {
  var settings = _lodash2.default.cloneDeep(newSettings);

  exports.config = config = _lodash2.default.assign({}, config, {
    engine: settings.engine,
    stateServer: settings.stateServer,
    processServer: settings.flowServer,
    flogoWeb: settings.db,
    flogoWebActivities: settings.activities,
    flogoWebTriggers: settings.triggers
  });
}

function resetConfiguration() {
  exports.config = config = _lodash2.default.cloneDeep(originalConfig);
}