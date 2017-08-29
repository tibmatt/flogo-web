import { config } from '../../config/app-config';
import {isJSON } from '../../common/utils';
import _ from 'lodash';
import request from 'co-request';

let basePath = config.app.basePath;

let services = [];
services['engine']      = config.engine;
services['stateServer'] = config.stateServer;
services['flowServer']  = config.processServer;
services['flogo-web']  = config.flogoWeb;
services['flogo-web-activities']  = config.flogoWebActivities;
services['flogo-web-triggers']  = config.flogoWebTriggers;

export function ping(app, router){
  if(!app){
    console.error("[Error][api/ping/index.js]You must pass app");
  }

  router.post(basePath+"/ping/service", pingService);

  //router.get(basePath+"/ping/configuration", pingConfiguration);
}

/*
function* pingConfiguration(next) {
  this.body = {
    engine: config.engine,
    stateServer:  config.stateServer,
    flowServer: config.processServer,
    webServer: config.webServer,
    db: config.flogoWeb,
    activities: config.flogoWebActivities,
    triggers: config.flogoWebTriggers
  };
  yield next;
}
*/
/**
 * @swagger
 *  /ping/service:
 *    post:
 *      tags:
 *        - Ping
 *      summary: Validate id the current configuration is working properly.
 *      parameters:
 *        - name: config
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              config:
 *                $ref: '#/definitions/Service'
 *
 *      responses:
 *        '200':
 *          description: Everything Ok
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: string
 *                default: ok
 *        '500':
 *          description: Error on configuration
 */
function* pingService(next){

  try{
    let data = this.request.body.config ||{};
    if(typeof this.request.body == 'string'){
      if(isJSON(this.request.body)){
        data = JSON.parse(this.request.body);
      }
    }

    let service = services[data.name];

    if(typeof service == 'undefined') {
      console.log(data);
      throw new Error('Wrong service name in pingService');
    }

    let protocol = data.protocol || service.protocol;
    let host     = data.host     || service.host;
    let port     = data.port     || service.port;
    let testPath = data.testPath || service.testPath;
    let url = protocol + '://' + host + ':' + port + '/v1/' + testPath;

    let result = yield request(url);
    if(result.statusCode && result.statusCode != 200) {
      throw new Error('Error');
    }
    this.body = result.body;
  }catch(err){
    this.throw(err.message, 500);
  }

  yield next;
}
/**
 * @swagger
 * definition:
 *  Service:
 *    type: object
 *    properties:
 *      protocol:
 *        type: string
 *      host:
 *        type: string
 *      port:
 *        type: string
 *      testPath:
 *        type: string
 *      name:
 *        type: string
 *      label:
 *        type: string
 *      bd:
 *        type: object
 *        properties:
 *          port:
 *            type: string
 *          name:
 *            type: string
 */
