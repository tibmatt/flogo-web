import path from 'path';
import { extractDomain } from '../common/utils';
import _ from 'lodash';

import {
  DBService
} from '../common/db.service';

let rootPath = path.normalize(__dirname + '/..');

let publicPath = path.normalize(rootPath+'/../public');

let FLOW_SERVICE_HOST = process.env.FLOGO_FLOW_SERVICE_HOST || "localhost";
let FLOW_STATE_SERVICE_HOST = process.env.FLOGO_FLOW_STATE_SERVICE_HOST || "localhost";
let FLOW_WEB_HOST = extractDomain(process.env.FLOGO_FLOW_WEB_HOST || "localhost");

console.log("rootPath: ", rootPath);
console.log("publicPath: ", publicPath);



let config = {
  db: 'http://localhost:5984/flogo-web',
  rootPath: rootPath,
  publicPath: publicPath,
  app: {
    basePath: '/v1/api',
    port: process.env.PORT || 3010,
    cacheTime: 0, //7 * 24 * 60 * 60 * 1000 /* default caching time (7 days) for static files, calculated in milliseconds */
    gitRepoCachePath : path.join( rootPath, 'git-cache' )
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
      "sendWSMessage":{
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
      "tibco-timer":{
        path: "github.com/TIBCOSoftware/flogo-contrib/trigger/timer"
      },
      "tibco-coap":{
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
      "tibco-coap":{
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
    installConfig: {
    },
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
    host: FLOW_WEB_HOST,
    port: "8080",
    testPath: "status"
  }
};

export {
  config
};

let triggersDBService = new DBService(config.triggers.db);
let activitiesDBService = new DBService(config.activities.db);
let dbService = new DBService(config.db);

let engines = {
  "test": undefined,
  "build": undefined
};

export {
  triggersDBService
};
export {
  activitiesDBService
};
export {
  dbService
};
export {
  engines
};

export let flowExport = {
  filename: 'flogo.export.json'
};

export function setConfiguration(newSettings) {
  let settings = _.cloneDeep(newSettings);

  config = _.assign({}, config, {
    engine: settings.engine,
    stateServer:  settings.stateServer,
    processServer: settings.flowServer,
    flogoWeb: settings.db,
    flogoWebActivities: settings.activities,
    flogoWebTriggers: settings.triggers
  });

}
