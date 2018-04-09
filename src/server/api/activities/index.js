import { config } from '../../config/app-config';
import { DEFAULT_PATH_ACTIVITY, TYPE_ACTIVITY } from '../../common/constants';
import { inspectObj } from '../../common/utils';
import { getContribInstallationController as getInstallationController } from '../../modules/engine';
import { RemoteInstaller } from '../../modules/remote-installer';
import { ActivitiesManager } from '../../modules/activities';
import path from 'path';

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
  const url = preProcessURLs( this.request.body.urls );
  console.log( '[log] Install Activity' );
  inspectObj( url );

  const installController = yield getInstallationController(config.defaultEngine.path, remoteInstaller);

  const result = yield installController.install(url);

  delete result.details; // keep the details internally.

  this.body = result;

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
  // Assuming that we are only installing one contribution for an API call, selecting only the first URL in the array
  return urls.shift();
}
