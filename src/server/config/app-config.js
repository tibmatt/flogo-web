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
  activities:{
    db: "http://localhost:5984/flogo-web-activities",
    defaultPath: "../../submodules/flogo-contrib/activity",
    contribPath: "../../contrib/activity",
    default:{
      "rest": "github.com/TIBCOSoftware/flogo-contrib/activity/rest",
      "log": "github.com/TIBCOSoftware/flogo-contrib/activity/log"
    },
    contrib:{

    }
  },
  triggers:{
    db: "http://localhost:5984/flogo-web-triggers",
    defaultPath: "../../submodules/flogo-contrib/trigger",
    contribPath: "../../contrib/trigger",
    default: {
      "rest": "github.com/TIBCOSoftware/flogo-contrib/trigger/rest",
      "mqtt": "github.com/TIBCOSoftware/flogo-contrib/trigger/mqtt",
      "timer": "github.com/TIBCOSoftware/flogo-contrib/trigger/timer"
    }
  },
  models:{
    db: "http://localhost:5984/flogo-web-models",
    defaultPath: "../../submodules/flogo-contrib/model",
    contribPath: "../../contrib/model"
  },
  engine:{
    host: "localhost",
    port: "8080",
    path: "./",
    name: "default-engine",
    triggers:{
      "rest": {     /*default configure for rest*/
        "port": "4010"
      }
    }
  },
  stateServer:{
    host: "localhost",
    port: "9190"
  },
  processServer:{
    host: "localhost",
    port: "9090"
  }
};

export {config};
