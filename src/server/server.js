import 'babel-polyfill';
import koa from 'koa';
import koaStatic from 'koa-static';
var router = require('koa-router')();
import bodyParser from 'koa-body';
import compress from 'koa-compress';
import {config, activitiesDBService, triggersDBService, dbService, engines} from './config/app-config';
import { inspectObj } from './common/utils';

import {api} from './api';

import {RegisterActivities} from './modules/activities';
import {RegisterTriggers} from './modules/triggers';
import { getInitialisedTestEngine, getInitialisedBuildEngine } from './modules/engine';
import path from 'path';

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

if ( !process.env[ 'FLOGO_SKIP_PKG_INSTALL' ] ) {

  let registerActivitiesPromise = (() => {
    return new Promise( ( resolve, reject ) => {
      const reg = new RegisterActivities( activitiesDBService, {
        defaultPath : path.resolve( config.rootPath, config.activities.defaultPath ),
        defaultConfig : config.activities.default,
        customPath : path.resolve( config.rootPath, config.activities.contribPath ),
        customConfig : config.activities.contrib
      } );

      return reg.register()
        .then( ()=> {
          console.log( "[success]registerActivities success" );
          resolve( true );
        } )
        .catch( ( err )=> {
          console.log( "[error]registerActivities error" );
          reject( err );
        } );
    } );
  })();

  let registerTriggersPromise = (()=> {
    return new Promise( ( resolve, reject ) => {
      const reg = new RegisterTriggers( triggersDBService, {
        defaultPath : path.resolve( config.rootPath, config.triggers.defaultPath ),
        defaultConfig : config.triggers.default,
        customPath : path.resolve( config.rootPath, config.triggers.contribPath ),
        customConfig : config.triggers.contrib
      } );

      return reg.register()
        .then( ()=> {
          console.log( "[success]registerTriggers success" );
          resolve( true );
        } )
        .catch( ( err )=> {
          console.log( "[error]registerTriggers error" );
          reject( err );
        } );
    } );
  })();

  Promise.all( [ registerActivitiesPromise, registerTriggersPromise ] )
    .then( ()=> {
      return getInitialisedTestEngine();
    } )
    .then( ( testEngine ) => {
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
      console.log( `[log] start web server...` );
      return initServer();
    } )
    .catch( ( err )=> {
      console.log( err );
      throw err;
    } );

} else {
  initServer();
}

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
}
