var fs = require('fs');
var path = require('path');
const http = require('http')

import koa from 'koa';
import koaStatic from 'koa-static';
var router = require('koa-router')();
import bodyParser from 'koa-body';
import compress from 'koa-compress';
var cors = require('koa-cors');

import { config } from './config/app-config';

import {api} from './api';
import {init as initWebsocketApi} from './api/ws';
import {syncTasks, getInitializedEngine, ensureDefaultDirs} from './modules/init';

import { ErrorManager, ERROR_TYPES } from './common/errors';
import { logger } from './common/logging';

// TODO Need to use cluster to improve the performance

let app;
let server;

import { resolveExpressionType } from 'flogo-parser';
console.log(resolveExpressionType('$activity[x].y'))

/**
 * Server start logic
 *
 * 1. register default activities and triggers.
 * 2. initialise the default engine (the test engine)
 * 3. start the test engine.
 * 4. configure the server and start listening
 */

export default ensureDefaultDirs()
  .then(() => getInitializedEngine(config.defaultEngine.path, {
    forceCreate: !!process.env['FLOGO_WEB_ENGINE_FORCE_CREATION']
  }))
  .then(engine => engine.build({ copyFlogoDescriptor: true })
      .then(() => engine.stop())
      .then(() => engine.start())
      .then(() => syncTasks(engine)),
  )
  .then(() => initServer())
  .then((newServer) => {
    server = newServer;
    if (!process.env['FLOGO_WEB_DISABLE_WS']) {
      return initWebsocketApi(newServer);
    }
    logger.info('Won\'t start websocket service');
    return null;
  })
  // .then(() => flowsDBService
  //   .verifyInitialDataLoad(path.resolve('db-init/installed-flows.init'))
  //   .then(() => installDefaults())
  //   .then(() => installSamples()))
  .then(() => {
    console.log('flogo-web::server::ready');
    showBanner();
    return { server, app };
  })
  .catch((err) => {
    logger.error(err);
    throw err;
  });


function initServer() {

  return new Promise((resolve, reject)=> {

    app = koa();

    let port = config.app.port;

    app.use(cors({ methods: 'GET,HEAD,PATCH,PUT,POST,DELETE' }));

    api(app, router);
    router.use(bodyParser({
      multipart: true,
      onError() {
        throw ErrorManager.createRestError('Body parse error', { type: ERROR_TYPES.COMMON.BAD_SYNTAX });
      },
    }));

    // make sure deep link it works
    app.use(function* (next) {
      var path = this.path.endsWith('/') ? this.path.substring(0, this.path.length - 1) : this.path;

      // not include restful api
      if (!/\/[^\/]+\.[^.\/]+$/i.test(path) && path.toLowerCase()
          .search('/api/') === -1) {
        this.path = '/';
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
    app.use(koaStatic(config.publicPath, {maxage: config.app.cacheTime}));

    app.on('error', function (err) {
      if (401 == err.status) {
        return;
      }
      if (404 == err.status) {
        return;
      }

      logger.error(err);
      reject(err);
    });

    app.use(router.routes())
      .use(router.allowedMethods());

    // logger
    app.use(function* (next) {
      const start = new Date();
      yield next;
      const ms = new Date() - start;
      logger.verbose('%s %s - %s', this.method, this.url, ms);
      logger.verbose(this.body);
      logger.verbose(this.request.body);
    });

    let server = http.createServer(app.callback());

    // when server is imported from another module we'll let the other module start the server
    // this allows us to manually close the server when testing
    if (!module.parent) {
      server.listen(port, () => {
        console.log('[log] start web server done.');
        resolve(server);
      });
    } else {
      resolve(server);
    }

  });
}

function showBanner() {
  console.log(`
  ======================================================
                 ___       __   __   __ TM
                |__  |    /  \\ / _\` /  \\
                |    |___ \\__/ \\__| \\__/
   
   [success] open http://localhost:3303 in your browser
  ======================================================
`);
}
