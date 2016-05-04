import path from 'path';

let rootPath = path.normalize(__dirname + '/..');

console.log("rootPath: ", rootPath);

let config = {
  db: 'http://localhost:5984/flogo-web',
  rootPath: rootPath,
  app: {
    basePath: '/v1/api',
    port: process.env.PORT || 3010,
    cacheTime: 7 * 24 * 60 * 60 * 1000 /* default caching time (7 days) for static files, calculated in milliseconds */
  },
  activities: {
    db: "http://localhost:5984/flogo-web-activities",
    defaultPath: "../../submodules/flogo-contrib/activity",
    contribPath: "../../contrib/activity",
    default: {
      "counter":{
        path:"github.com/TIBCOSoftware/flogo-contrib/activity/counter"
      },
      "rest": {
        path: "github.com/TIBCOSoftware/flogo-contrib/activity/rest"
      },
      "log": {
        path: "github.com/TIBCOSoftware/flogo-contrib/activity/log"
      },
      "twilio": {
        path: "github.com/TIBCOSoftware/flogo-contrib/activity/twilio"
      }
    },
    contrib: {}
  },
  triggers: {
    db: "http://localhost:5984/flogo-web-triggers",
    defaultPath: "../../submodules/flogo-contrib/trigger",
    contribPath: "../../contrib/trigger",
    default: {
      "rest": {
        path: "github.com/TIBCOSoftware/flogo-contrib/trigger/rest"
      },
      "mqtt": {
        path: "github.com/TIBCOSoftware/flogo-contrib/trigger/mqtt",
        ignore: true
      },
      "timer": {
        path: "github.com/TIBCOSoftware/flogo-contrib/trigger/timer",
        ignore: true
      }
    }
  },
  models: {
    db: "http://localhost:5984/flogo-web-models",
    defaultPath: "../../submodules/flogo-contrib/model",
    contribPath: "../../contrib/model"
  },
  engine: {
    host: "localhost",
    port: "8080",
    path: "./",
    name: "defaultengine",
    triggers: {
      "tibco-mqtt": {
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
      },
      "tibco-rest": {
        "name": "tibco-rest",
        "settings": {
          "port": "9990"
        },
        "endpoints": null
      },
      "tibco-timer": {
        "name": "tibco-timer",
        "settings": {
        },
        "endpoints": null
      }
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
      "services": [
        {
          "name": "stateRecorder",
          "enabled": true,
          "settings": {
            "host": "localhost",
            "port": "9190"
          }
        },
        {
          "name": "flowProvider",
          "enabled": true
        },
        {
          "name": "engineTester",
          "enabled": true,
          "settings": {
            "port": "8080"
          }
        }
      ]
    }
  },
  stateServer: {
    host: "localhost",
    port: "9190"
  },
  processServer: {
    host: "localhost",
    port: "9090"
  }
};

export {config};
