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
    path: "../../submodules/flogo-contrib/activity"
  },
  triggers:{
    db: "http://localhost:5984/flogo-web-triggers",
    path: "../../submodules/flogo-contrib/trigger"
  },
  models:{
    db: "http://localhost:5984/flogo-web-models",
    path: "../../submodules/flogo-contrib/model"
  },
  engine:{
    host: "localhost",
    port: "8080",
    path: "./",
    name: "default-engine"
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
