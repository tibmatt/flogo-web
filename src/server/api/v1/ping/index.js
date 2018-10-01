import request from 'co-request';
import url from 'url';

import { config } from '../../../config/app-config';
import { isJSON } from '../../../common/utils/index';

let services = [];
services['engine']      = config.engine;
services['stateServer'] = config.stateServer;
services['flowServer']  = config.processServer;
services['flogo-web']  = config.flogoWeb;
services['flogo-web-activities']  = config.flogoWebActivities;
services['flogo-web-triggers']  = config.flogoWebTriggers;

export function ping(router){
  router.post('/ping/service', pingService);
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
async function pingService(ctx, next){

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

    const serviceUrl = url.format({
      protocol: data.protocol || service.protocol,
      hostname: data.host || service.host,
      port: data.port || service.port,
      pathname: data.testPath || service.testPath,
    });

    const result = await request(serviceUrl);
    if (result.statusCode && result.statusCode != 200) {
      throw new Error('Error');
    }
    this.body = result.body;
  } catch(err){
    this.throw(err.message, 500);
  }

  return next();
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
