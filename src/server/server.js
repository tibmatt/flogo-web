import 'babel-polyfill';
import path from 'path';
import request from 'co-request';

import koa from 'koa';
import koaStatic from 'koa-static';
var router = require('koa-router')();
import bodyParser from 'koa-body';
var fs = require('fs');
import compress from 'koa-compress';

import { inspectObj } from './common/utils';
import {config, triggersDBService, activitiesDBService} from './config/app-config';
import {api} from './api';
import { getInitialisedTestEngine, getInitialisedBuildEngine } from './modules/engine';
import { installAndConfigureTasks, loadTasksToEngines } from './modules/init'
import {createFlowFromJson} from './api/flows/index';

// TODO Need to use cluster to improve the performance

let app;

/**
 * Server start logic
 *
 * 1. register default activities and triggers.
 * 2. initialise the default engine (the test engine) and build engine.
 * 3. start the test engine.
 * 4. configure the server and start listening
 */

let startConfig = Promise.resolve(true);
if ( process.env[ 'FLOGO_NO_ENGINE_RECREATION' ] ) {
  startConfig = startConfig
    .then(() => triggersDBService.verifyInitialDataLoad(path.resolve('db-init/installed-triggers.init')))
    .then(() => activitiesDBService.verifyInitialDataLoad(path.resolve('db-init/installed-activities.init')))
    .then(() => loadTasksToEngines());
} else {
  startConfig = startConfig.then(installAndConfigureTasks);
}

startConfig
  .then( ()=> {
    return getInitialisedTestEngine();
  } )
  .then( ( testEngine ) => {
    console.log('############ TEST ENGINE ####################');
    console.log('~~~ ACTIVITIES ~~~');
    console.log(testEngine.installedActivites);
    console.log('~~~ Triggers ~~~');
    console.log(testEngine.installedTriggers);
    return testEngine.build()
      .then( ()=> {
        console.log( "[log] build test engine done." );
        return testEngine.start();
      } );
  } )
  .then( ()=> {
    console.log( "[log] start test engine done" );
    return getInitialisedBuildEngine();
  } )
  .then( ( buildEngine )=> {
    console.log('############ BUILD ENGINE ####################');
    console.log('~~~ ACTIVITIES ~~~');
    console.log(buildEngine.installedActivites);
    console.log('~~~ Triggers ~~~');
    console.log(buildEngine.installedTriggers);
    console.log( `[log] start web server...` );
    return initServer();
  } )
  .catch( ( err )=> {
    console.log( err );
    throw err;
  } );


function initServer() {

  return new Promise( ( resolve, reject )=> {

    app = koa();

    let port = config.app.port;

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


    app.listen( port, ()=> {
      console.log( `[log] start web server done.` );
      showInitBanner();
      resolve( app );
    } );
  } );
}

function showInitBanner() {
  console.log("=============================================================================================");
  console.log("[success] open http://localhost:3010 or http://localhost:3010/_config in your browser");
  console.log("=============================================================================================");
  installSamples();
}

function  installSamples() {
  var samples = JSON.parse(fs.readFileSync(path.join(__dirname,'config/samples.json'), 'utf8'));

  samples.forEach( (sample)=> {
      request({ uri: sample.url, method: 'GET', json: true })
        .then((res) => {
            createFlowFromJson(res.body)
              .then(()=> {
                console.log('Installed:', sample.url);
             })
        })
  });

}
