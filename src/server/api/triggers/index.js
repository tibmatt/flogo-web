import {config, triggersDBService} from '../../config/app-config';
import { TYPE_TRIGGER, DEFAULT_PATH_TRIGGER } from '../../common/constants';
import { RemoteInstaller } from '../../modules/remote-installer';
import { inspectObj } from '../../common/utils';
import _ from 'lodash';
import path from 'path';
import semver from 'semver';
import { getInitialisedTestEngine } from '../../modules/engine';

let basePath = config.app.basePath;

let remoteInstaller = new RemoteInstaller( {
  type : TYPE_TRIGGER,
  registerPath : path.join( config.rootPath, DEFAULT_PATH_TRIGGER )
} );

export function triggers(app, router){
  if(!app){
    console.error("[Error][api/triggers/index.js]You must pass app");
  }
  router.get(basePath+"/triggers", getTriggers);
  router.post(basePath+"/triggers", installTriggers);
  router.delete(basePath+"/triggers", deleteTriggers);
}

function* getTriggers(next){
  let data = [];

  data = yield triggersDBService.allDocs({ include_docs: true })
    .then(triggers => triggers.map(trigger => {
      return Object.assign({}, _.pick(trigger, ['_id', 'name', 'title', 'version', 'description']), { title: _.get(trigger, 'schema.title')});
    }));

  this.body = data;
  yield next;
}

function* installTriggers( next ) {
  let urls = preProcessURLs( this.request.body.urls );

  console.log( '[log] Install Triggers' );
  inspectObj( urls );
  let results = yield remoteInstaller.install( urls );
  console.log( '[log] Installation results' );
  inspectObj( {
    success : results.success,
    fail : results.fail
  } );

  let testEngine = yield getInitialisedTestEngine();

  if ( testEngine ) {

    console.log( `[log] adding triggers to test engine...` );

    let stopTestEngineResult = yield testEngine.stop();

    if ( !stopTestEngineResult ) {
      throw new Error( '[error] Encounter error to stop test engine.' );
    }

    try {
      const addTriggersResult = [];

      for ( let successItemURL of results.success ) {
        console.log( `[log] adding ${ successItemURL } to test engine ...` );
        const item = results.details[ successItemURL ];
        const itemInfoToInstall = {
          name : item.schema.name || item.package.name,
          path : item.path,
          version : item.package.version || item.schema.version
        };

        inspectObj( itemInfoToInstall );

        let addTriggerResult = yield new Promise( ( resolve, reject )=> {

          const addOnError = ( err )=> {
            // if error happens, just note it down and report adding trigger failed.
            console.log(
              `[error] failed to add trigger ${ itemInfoToInstall.name } [${ itemInfoToInstall.path }]` );
            console.log( err );
            resolve( false );
          };

          const hasTrigger = testEngine.hasTrigger( itemInfoToInstall.name, itemInfoToInstall.path );

          inspectObj( hasTrigger );

          if ( hasTrigger.exists ) {
            if ( hasTrigger.samePath && hasTrigger.version && itemInfoToInstall.version &&
              semver.lte( itemInfoToInstall.version, hasTrigger.version ) ) {
              console.log(
                `[log] skip adding exists trigger ${ itemInfoToInstall.name } (${ itemInfoToInstall.version }) [${ itemInfoToInstall.path }]` );
              resolve( true );
            } else {
              // else delete the trigger before install, but keep the previous configuration in `flogo.json`
              return testEngine.deleteTrigger( itemInfoToInstall.name, true )
                .then( ()=> {
                  return testEngine.addTrigger( itemInfoToInstall.name, itemInfoToInstall.path,
                    itemInfoToInstall.version );
                } )
                .then( ()=> {
                  resolve( true );
                } )
                .catch( addOnError );
            }
          } else {
            return testEngine.addTrigger( itemInfoToInstall.name, itemInfoToInstall.path, itemInfoToInstall.version )
              .then( ()=> {
                resolve( true );
              } )
              .catch( addOnError );
          }
        } );

        addTriggersResult.push( addTriggerResult );
      }
    } catch ( err ) {
      console.error( `[error] add triggers to test engine` );
      console.error( err );
      throw new Error( '[error] Encounter error to add triggers to test engine.' );
    }

    // clean the triggers configurations for the test engine.
    testEngine.updateTriggerJSON( {
      "triggers" : []
    }, true );

    let testEngineBuildResult = yield testEngine.build();

    if ( !testEngineBuildResult ) {
      throw new Error( '[error] Encounter error to build test engine after adding triggers.' );
    }

    let testEngineStartResult = yield testEngine.start();

    if ( !testEngineStartResult ) {
      throw new Error( '[error] Encounter error to start test engine after adding triggers.' );
    }
  }

  delete results.details; // keep the details internally.
  this.body = results;

  yield next;
}

function* deleteTriggers( next ) {

  console.log( '------- ------- -------' );
  console.log( 'Delete Triggers' );
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
