import {config} from '../../config/app-config';
import { TYPE_TRIGGER, DEFAULT_PATH_TRIGGER } from '../../common/constants';
import { RemoteInstaller } from '../../modules/remote-installer';
import { inspectObj } from '../../common/utils';
import path from 'path';
import { getInitializedEngine } from '../../modules/engine';
import { TriggerManager } from '../../modules/triggers';
import {ContribInstallController} from "../../modules/engine/contrib-install-controller";

let basePath = config.app.basePath;

let remoteInstaller = new RemoteInstaller( {
  type : TYPE_TRIGGER,
  registerPath : path.join( config.rootPath, DEFAULT_PATH_TRIGGER )
} );

export function triggers(app, router){
  if(!app){
    console.error("[Error][api/triggers/index.js]You must pass app");
  }
  router.get(basePath+"/triggers", listTriggers);
  router.post(basePath+"/triggers", installTriggers);
  router.delete(basePath+"/triggers", deleteTriggers);
}

/**
 * @swagger
 *  /triggers:
 *    get:
 *      tags:
 *        - Trigger
 *      summary: Get all the triggers installed in the engine.
 *      responses:
 *        '200':
 *          description: All triggers obtained successfully.
 *          schema:
 *            type: array
 *            items:
 *              $ref: '#/definitions/Trigger'
 */
function* listTriggers() {
  const searchTerms = {};
  const filterName     = this.request.query['filter[name]'];
  const filterRef = this.request.query['filter[ref]'];

  if (filterName)     { searchTerms.name  = filterName;     }
  if (filterRef) { searchTerms.ref = filterRef; }

  const foundTriggers = yield TriggerManager.find(searchTerms);
  this.body = {
    data: foundTriggers || [],
  };
}

/**
 * @swagger
 * /triggers:
 *    post:
 *      tags:
 *        - Trigger
 *      summary: Install new Triggers in the engine
 *      parameters:
 *        - name: urls
 *          in: body
 *          description: Urls to the triggers to be installed
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Urls'
 *      responses:
 *        '200':
 *          description: New triggers installed successfully
 */
function* installTriggers( next ) {
  this.req.setTimeout(0);
  const url = preProcessURLs( this.request.body.urls );
  console.log( '[log] Install Trigger' );
  inspectObj( url );

  let testEngine = yield getInitializedEngine(config.defaultEngine.path);
  let installController = new ContribInstallController(testEngine, remoteInstaller);
  const result = yield installController.install(url);

  delete result.details; // keep the details internally.

  this.body = result;

  yield next;
}

/**
 * @swagger
 *  /triggers:
 *    delete:
 *      tags:
 *        - Trigger
 *      summary: Not implemented yet
 *      responses:
 *        '200':
 *          description: To be defined
 */
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
  // Assuming that we are only installing one contribution for an API call, selecting only the first URL in the array
  return urls.shift();
}
/**
 * @swagger
 * definition:
 *  Trigger:
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
 *      settings:
 *        type: array
 *        items:
 *          $ref: '#/definitions/Attribute'
 *      outputs:
 *        type: array
 *        items:
 *          $ref: '#/definitions/Attribute'
 *      endpoint:
 *        type: object
 *        properties:
 *          settings:
 *            type: array
 *            items:
 *              $ref: '#/definitions/Attribute'
 */

