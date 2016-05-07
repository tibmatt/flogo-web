import koa from 'koa';
import koaStatic from 'koa-static';
var router = require('koa-router')();
import bodyParser from 'koa-body';
import compress from 'koa-compress';
import {config, activitiesDBService, triggersDBService, dbService} from './config/app-config';

import {api} from './api';

import {RegisterActivities} from './modules/activities';
import {RegisterTriggers} from './modules/triggers';
import {Engine} from './modules/engine';
import path from 'path';

// TODO Need to use cluster to improve the performance

let app = koa();
let port = config.app.port;

api(app, router);

let engine = new Engine(config.testEngine);
let buildEngine = new Engine(config.buildEngine);

let registerActivities  = new RegisterActivities(activitiesDBService, {
  defaultPath: path.resolve(config.rootPath, config.activities.defaultPath),
  defaultConfig: config.activities.default,
  customPath: path.resolve(config.rootPath, config.activities.contribPath),
  customConfig: config.activities.contrib
});

let registerTriggers  = new RegisterTriggers(triggersDBService, {
  defaultPath: path.resolve(config.rootPath, config.triggers.defaultPath),
  defaultConfig: config.triggers.default,
  customPath: path.resolve(config.rootPath, config.triggers.contribPath),
  customConfig: config.triggers.contrib
});

//registerActivities.register().then(()=>{
//  return registerTriggers.register();
//}).then(()=>{
//  console.log("[info] All promise finished");
//  engine.config();
//  console.log("[info] finish config");
//  engine.build();
//  console.log("[info] finish build");
//  engine.start();
//  console.log("[info] finish start");
//}).catch((err)=>{
//  console.log("[error] registerActivities error");
//});


//
let PromiseAll = [];
let activityPromise = new Promise((resolve, reject)=>{
  registerActivities.register().then(()=>{
    console.log("[success]registerActivities success");
    resolve(true);
  }).catch((err)=>{
    console.log("[error]registerActivities error");
    reject(err);
  });
});

PromiseAll.push(activityPromise);

let triggerPromise = new Promise((resolve, reject)=>{
  registerTriggers.register().then(()=>{
    console.log("[success]registerTriggers success");
    resolve(true);
  }).catch((err)=>{
    console.log("[error]registerTriggers error");
    reject(err);
  });
});

PromiseAll.push(triggerPromise);

Promise.all(PromiseAll).then(()=>{
  engine.addAllActivities().then(()=>{
    return engine.addAllTriggers(config.testEngine.installConfig);
  }).then(()=>{
    //console.log("[info]All promise finished");
    engine.config();
    //console.log("[info] finish config");
    engine.build();
    //console.log("[info] finish build");
    engine.start();
    //console.log("[info] finish start");
    buildEngine.addAllActivities().then(()=>{
      buildEngine.addAllTriggers();
    });
  }).catch((err)=>{

  });

}).catch((err)=>{
  console.log(err);
});

// make sure deep link it works
app.use(function *(next){
  var path = this.path.endsWith('/')? this.path.substring(0, this.path.length - 1): this.path;

  // not include restful api
  if(!/\/[^\/]+\.[^.\/]+$/i.test(path)&&path.toLowerCase().search('/api/')===-1){
    this.path='/';
  }
  yield  next;
});

// compress
app.use(compress({
  filter: function (content_type) {
    return /text/i.test(content_type)
  },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}));

// server static resources
app.use(koaStatic("../public"));
app.use(bodyParser());

app.on('error', function(err){
  if (401 == err.status) return;
  if (404 == err.status) return;

  console.error(err.toString());
});

app.use(router.routes());

// logger
app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
  console.log(this.body);
  console.log(this.request.body);
});

app.listen(port);
