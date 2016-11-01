import 'babel-polyfill';
import path from 'path';
var fs = require('fs');

import koa from 'koa';
import koaStatic from 'koa-static';
var router = require('koa-router')();
import bodyParser from 'koa-body';
import compress from 'koa-compress';
var cors =  require('koa-cors');

import {config} from './config/app-config';
import {api} from './api';
import {init as initWebsocketApi} from './api/ws';
import { syncTasks, installSamples } from './modules/init';
import { isDirectory, createFolder as createDirectory } from './common/utils'

// TODO Need to use cluster to improve the performance

// Where we store the local files
const LOCAL_DIR = 'local/engines';
if(!isDirectory(LOCAL_DIR)) {
  createDirectory(LOCAL_DIR)
}

let app;


/**
 * Server start logic
 *
 * 1. register default activities and triggers.
 * 2. initialise the default engine (the test engine) and build engine.
 * 3. start the test engine.
 * 4. configure the server and start listening
 */


// if ( process.env[ 'FLOGO_NO_ENGINE_RECREATION' ] ) {
//   startConfig = startConfig
//     .then(() => triggersDBService.verifyInitialDataLoad(path.resolve('db-init/installed-triggers.init')))
//     .then(() => activitiesDBService.verifyInitialDataLoad(path.resolve('db-init/installed-activities.init')))
//     .then(() => flowsDBService.verifyInitialDataLoad(path.resolve('db-init/installed-flows.init')))
//     .then(() => loadTasksToEngines());
// } else {
//   startConfig = startConfig
//                 .then(syncTasks);
//
//   if ( process.env['FLOGO_INSTALL_SAMPLES'] ) {
//     startConfig = startConfig.then(installSamples);
//   }
//
// }
//
// startConfig
//   .then( ()=> {
//     return getInitialisedTestEngine();
//   } )
//   .then( ( testEngine ) => {
//     console.log('############ TEST ENGINE ####################');
//     console.log('~~~ ACTIVITIES ~~~');
//     console.log(testEngine.installedActivites);
//     console.log('~~~ Triggers ~~~');
//     console.log(testEngine.installedTriggers);
//     return testEngine.build()
//       .then( ()=> {
//         console.log( "[log] build test engine done." );
//         return testEngine.start();
//       } );
//   } )
//   .then( ()=> {
//     console.log( "[log] start test engine done" );
//     return getInitialisedBuildEngine();
//   } )
//   .then( ( buildEngine )=> {
//     console.log('############ BUILD ENGINE ####################');
//     console.log('~~~ ACTIVITIES ~~~');
//     console.log(buildEngine.installedActivites);
//     console.log('~~~ Triggers ~~~');
//     console.log(buildEngine.installedTriggers);
//     console.log( `[log] start web server...` );
//     return initServer();
//   } )
let Engine = require('./modules/engine/engine');

let engine = new Engine(config.defaultEngine.path);

engine.exists()
  .then(function(engineExists){
    if(!engineExists) {
      console.info('Engine does not exist. Creating...');
      return engine.create()
        .then(() => {
          console.info('New engine created');
          // TODO: add pallette version
          let palettePath = path.resolve('config', config.defaultEngine.defaultPalette);
          console.info('Will install palette at ' + palettePath);
          return engine.installPalette(palettePath);
        })
    }
  })
  .then(() => engine.load())
  .then(console.log)
  .then(() => syncTasks(engine))
  .then(() => initServer())
  .then(() => {
    process.env['FLOGO_INSTALL_SAMPLES'] ? installSamples() : null
  })
  .then((server) => {
    initWebsocketApi(server);
  })
  .then(() => {
    console.log('flogo-web::server::ready');
    showBanner();
  })
  .catch( ( err )=> {
    console.log( err );
    throw err;
  } );


function initServer() {

  return new Promise( ( resolve, reject )=> {

    app = koa();

    let port = config.app.port;

    app.use(cors());

    api( app, router );

    // make sure deep link it works
    app.use( function *( next ) {
      var path = this.path.endsWith( '/' ) ? this.path.substring( 0, this.path.length - 1 ) : this.path;

      // not include restful api
      if ( !/\/[^\/]+\.[^.\/]+$/i.test( path ) && path.toLowerCase()
          .search( '/api/' ) === -1 ) {
        this.path = '/';
      }
      yield  next;
    } );

    // compress
    app.use( compress( {
      filter : function ( content_type ) {
        return /text/i.test( content_type )
      },
      threshold : 2048,
      flush : require( 'zlib' ).Z_SYNC_FLUSH
    } ) );

    // server static resources
    app.use( koaStatic( config.publicPath, { maxage : config.app.cacheTime } ) );
    app.use( bodyParser( { multipart : true } ) );

    app.on( 'error', function ( err ) {
      if ( 401 == err.status ) {
        return;
      }
      if ( 404 == err.status ) {
        return;
      }

      console.error( err.toString() );
      reject( err );
    } );

    app.use( router.routes() );

    // logger
    app.use( function *( next ) {
      var start = new Date;
      yield next;
      var ms = new Date - start;
      console.log( '%s %s - %s', this.method, this.url, ms );
      console.log( this.body );
      console.log( this.request.body );
    } );

    var server = require('http').createServer(app.callback());
    server.listen( port, ()=> {
      console.log( `[log] start web server done.` );

      resolve( server );
    } );
  } );
}

function showBanner() {
  console.log('flogo-web::server::ready');
  console.log("=============================================================================================");
  console.log(`[success] open http://localhost:${config.app.port} or http://localhost:${config.app.port}/_config in your browser`);
  console.log("=============================================================================================");
}
