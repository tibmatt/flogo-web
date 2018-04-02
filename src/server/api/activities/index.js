import { config } from '../../config/app-config';
import { DEFAULT_PATH_ACTIVITY, TYPE_ACTIVITY } from '../../common/constants';
import { inspectObj } from '../../common/utils';
import { getInitializedEngine } from '../../modules/engine';
import { RemoteInstaller } from '../../modules/remote-installer';
import { ActivitiesManager } from '../../modules/activities';
import path from 'path';
import {ContribInstallController} from "../../modules/engine/contrib-install-controller";

let basePath = config.app.basePath;

let remoteInstaller = new RemoteInstaller( {
  type : TYPE_ACTIVITY,
  registerPath : path.join( config.rootPath, DEFAULT_PATH_ACTIVITY )
} );

export function activities(app, router){
  if(!app){
    console.error("[Error][api/activities/index.js]You must pass app");
  }

  router.get(basePath+"/activities", listActivities);
  router.post(basePath+"/activities", installActivities);
  router.delete(basePath+"/activities", deleteActivities);
  router.post(basePath+"/test", testInstall);
}

function* testInstall(next) {
  this.req.setTimeout(0);
  let urls = preProcessURLs( this.request.body.urls );
  console.log( '[log] Install Activities' );
  inspectObj( urls );

  let testEngine = yield getInitializedEngine(config.defaultEngine.path);
  let installController = new ContribInstallController(testEngine, remoteInstaller);
  const result = yield installController.install(urls);

  this.body = result;

  yield next;

}

/**
 * @swagger
 * /activities:
 *  get:
 *    tags:
 *      - Activity
 *    responses:
 *      200:
 *        description: List all activities installed on the engine
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/Activity'
 */
function* listActivities() {
  const searchTerms = {};
  const filterName = this.request.query['filter[name]'];
  const filterRef = this.request.query['filter[ref]'];

  if (filterName) {
    searchTerms.name = filterName;
  }
  if (filterRef) {
    searchTerms.ref = filterRef;
  }

  const foundActivities = yield ActivitiesManager.find(searchTerms);
  this.body = {
    data: foundActivities || [],
  };
}

/**
 * @swagger
 * definition:
 *  Activity:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *      version:
 *        type: string
 *      description:
 *        type: string
 *      title:
 *        type: string
 *      inputs:
 *        type: array
 *        items:
 *          $ref: '#/definitions/Attribute'
 *      outputs:
 *        type: array
 *        items:
 *          $ref: '#/definitions/Attribute'
 */

/**
 * @swagger
 * /activities:
 *  post:
 *    tags:
 *      - Activity
 *    summary: Install new activities
 *    parameters:
 *      - name: urls
 *        in: body
 *        description: Urls of the activities to be installed
 *        required: true
 *        schema:
 *          $ref: '#/definitions/Urls'
 *    responses:
 *      200:
 *        description: 'Activity installed successfully'
 */
function* installActivities( next ) {
  this.req.setTimeout(0);
  let urls = preProcessURLs( this.request.body.urls );
  console.log( '[log] Install Activities' );
  inspectObj( urls );

  let testEngine = yield getInitializedEngine(config.defaultEngine.path);
  let results = {};
  if ( testEngine ) {

    console.log(`[log] backing up source folder...`);
    yield remoteInstaller.createBackup(testEngine.path);

    console.log( `[log] adding activities to test engine...` );

    let stopTestEngineResult = yield testEngine.stop();

    if ( !stopTestEngineResult ) {
      console.log(`[log] removing backup folders as stopping engine failed`);
      remoteInstaller.removeBackup(testEngine.path);
      throw new Error( '[error] Encounter error to stop test engine.' );
    }

    try {

      results = yield remoteInstaller.install( urls, {engine: testEngine} );
      console.log( '[log] Installation results' );
      inspectObj( {
        success : results.success,
        fail : results.fail
      } );
    } catch ( err ) {
      console.error( `[error] add activities to test engine` );
      console.error( err );
      console.log(`[log] removing backup folders as add activities to test engine failed`);
      remoteInstaller.removeBackup(testEngine.path);
      throw new Error( '[error] Encounter error to add activities to test engine.' );
    }

    let testEngineBuildResult = yield testEngine.build();

    if ( !testEngineBuildResult ) {
      console.log(`[log] removing backup folders as building engine failed`);
      remoteInstaller.removeBackup(testEngine.path);
      throw new Error( '[error] Encounter error to build test engine after adding activities.' );
    }

    let testEngineStartResult = yield testEngine.start();

    if ( !testEngineStartResult ) {
      console.log(`[log] removing backup folders as starting test engine failed`);
      remoteInstaller.removeBackup(testEngine.path);
      throw new Error( '[error] Encounter error to start test engine after adding activities.' );
    }
  }

  console.log(`[log] removing backup folders after adding activity to engine successfully`);
  remoteInstaller.removeBackup(testEngine.path);

  delete results.details; // keep the details internally.

  this.body = results;

  yield next;
}
/**
 * @swagger
 * definition:
 *  Urls:
 *    type: object
 *    properties:
 *      urls:
 *        type: array
 *        items:
 *          type: string
 *
 */

/**
 * TODO: unimplemented, should return proper http status
 *
 * @swagger
 * /activities:
 *    delete:
 *      tags:
 *        - Activity
 *      description: Uninstall activities from engine
 *      parameters:
 *        - name: urls
 *          in: body
 *          description: Urls of the activities to be uninstalled
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Urls'
 *      responses:
 *        '200':
 *          description: 'Activity uninstalled successfully'
 */
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
