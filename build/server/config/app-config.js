'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flowExport = exports.engines = exports.dbService = exports.activitiesDBService = exports.triggersDBService = exports.config = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _db = require('../common/db.service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rootPath = _path2.default.normalize(__dirname + '/..');

var publicPath = _path2.default.normalize(rootPath + '/../public');

var FLOW_SERVICE_HOST = process.env.FLOGO_FLOW_SERVICE_HOST || "localhost";
var FLOW_STATE_SERVICE_HOST = process.env.FLOGO_FLOW_STATE_SERVICE_HOST || "localhost";

console.log("rootPath: ", rootPath);
console.log("publicPath: ", publicPath);

var config = {
  db: 'http://localhost:5984/flogo-web',
  rootPath: rootPath,
  publicPath: publicPath,
  app: {
    basePath: '/v1/api',
    port: process.env.PORT || 3010,
    cacheTime: 0 //7 * 24 * 60 * 60 * 1000 /* default caching time (7 days) for static files, calculated in milliseconds */
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
  stateServer: {
    host: FLOW_STATE_SERVICE_HOST,
    port: "9190"
  },
  processServer: {
    host: FLOW_SERVICE_HOST,
    port: "9090"
  }
};

exports.config = config;


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