import {config, activitiesDBService} from '../../config/app-config';
import { TYPE_ACTIVITY, DEFAULT_PATH_ACTIVITY } from '../../common/constants';
import { inspectObj } from '../../common/utils';
import { getInitialisedTestEngine } from '../../modules/engine';
import { RemoteInstaller } from '../../modules/remote-installer';
import _ from 'lodash';
import path from 'path';
import semver from 'semver';

let basePath = config.app.basePath;

let remoteInstaller = new RemoteInstaller( {
  type : TYPE_ACTIVITY,
  registerPath : path.join( config.rootPath, DEFAULT_PATH_ACTIVITY )
} );

export function activities(app, router){
  if(!app){
    console.error("[Error][api/activities/index.js]You must pass app");
  }

  router.get(basePath+"/activities", getActivities);
  router.post(basePath+"/activities", installActivities);
  router.delete(basePath+"/activities", deleteActivities);
}

function* getActivities(next){
  let data = yield activitiesDBService.allDocs({ include_docs: true })
    .then(activities => activities.map(activity => {
      return Object.assign({}, _.pick(activity, ['_id', 'name', 'title', 'version', 'description']), { title: _.get(activity, 'schema.title') });
    }));

  this.body = data;
  yield next;
}

function* installActivities( next ) {
  let urls = preProcessURLs( this.request.body.urls );
  console.log( '[log] Install Activities' );
  inspectObj( urls );
  let results = yield remoteInstaller.install( urls );
  console.log( '[log] Installation results' );
  inspectObj( {
    success : results.success,
    fail : results.fail
  } );

  let testEngine = yield getInitialisedTestEngine();

  if ( testEngine ) {

    console.log( `[log] adding activities to test engine...` );

    let stopTestEngineResult = yield testEngine.stop();

    if ( !stopTestEngineResult ) {
      throw new Error( '[error] Encounter error to stop test engine.' );
    }

    try {
      let addActivitiesResult = yield Promise.all( _.map( results.success, ( successItemURL, idx ) => {
        console.log( `[log] adding ${ successItemURL } to test engine ...` );
        const item = results.details[ successItemURL ];
        const itemInfoToInstall = {
          name : item.schema.name || item.package.name,
          path : item.path,
          version : item.schema.version || item.package.version
        };

        inspectObj( itemInfoToInstall );

        return new Promise( ( resolve, reject )=> {

          const addOnError = ( err )=> {
            // if error happens, just note it down and report adding activity failed.
            console.log(
              `[error] failed to add activity ${ itemInfoToInstall.name } [${ itemInfoToInstall.path }]` );
            console.log( err );
            resolve( false );
          };

          const hasActivity = testEngine.hasActivity( itemInfoToInstall.name, itemInfoToInstall.path );

          if ( hasActivity.exists ) {
            if ( hasActivity.samePath && hasActivity.version && itemInfoToInstall.version && semver.lte( itemInfoToInstall.version, hasActivity.version ) ) {
              console.log(
                `[log] skip adding exists activity ${ itemInfoToInstall.name } (${ itemInfoToInstall.version }) [${ itemInfoToInstall.path }]` );
              resolve( true );
            } else {
              // else delete the activity before install
              return testEngine.deleteActivity( itemInfoToInstall.name )
                .then( ()=> {
                  return testEngine.addActivity( itemInfoToInstall.name, itemInfoToInstall.path, itemInfoToInstall.version );
                } ).then( ()=> {
                  resolve( true );
                } )
                .catch( addOnError );
            }
          } else {
            return testEngine.addActivity( itemInfoToInstall.name, itemInfoToInstall.path, itemInfoToInstall.version )
              .then( ()=> {
                resolve( true );
              } )
              .catch( addOnError );
          }
        } );
      } ) );
    } catch ( err ) {
      console.error( `[error] add activities to test engine` );
      console.error( err );
      throw new Error( '[error] Encounter error to add activities to test engine.' );
    }

    let testEngineBuildResult = yield testEngine.build();

    if ( !testEngineBuildResult ) {
      throw new Error( '[error] Encounter error to build test engine after adding activities.' );
    }

    let testEngineStartResult = yield testEngine.start();

    if ( !testEngineStartResult ) {
      throw new Error( '[error] Encounter error to start test engine after adding activities.' );
    }
  }

  delete results.details; // keep the details internally.

  this.body = results;

  yield next;
}

function* deleteActivities(next){
  console.log( '------- ------- -------' );
  console.log( 'Delete Activities' );
  console.log( this.request.body.urls );
  this.body = 'TODO';
  console.log( '------- ------- -------' );

  yield next;
}

function preProcessURLs( urls ) {
  'use strict';
  // TODO
  return urls;
}
