import { config, originalConfig, resetConfiguration, setConfiguration as setNewConfiguration } from '../../config/app-config';
import {isJSON } from '../../common/utils';
import _ from 'lodash';
import request from 'co-request';

let basePath = config.app.basePath;

export function configuration(app, router) {
  if(!app){
    console.error("[Error][api/ping/index.js]You must pass app");
  }

  router.post(basePath+"/configuration/", setConfiguration);
  router.get(basePath+"/configuration/reset", reset);
  router.get(basePath+"/configuration",  getConfiguration);
}
/**
 * @swagger
 *  /configuration:
 *    get:
 *      tags:
 *        - Configuration
 *      responses:
 *        200:
 *          description: Current configuration of the engine.
 *          schema:
 *            $ref: '#/definitions/Configuration'
 */
function* getConfiguration(next) {
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
/**
 * @swagger
 * definition:
 *  Database:
 *    type: object
 *    properties:
 *      protocol:
 *        type: string
 *      host:
 *        type: string
 *      port:
 *        type: string
 *      name:
 *        type: string
 *      label:
 *        type: string
 *      testPath:
 *        type: string
 *
 *  Activities-Triggers:
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
 *      label:
 *        type: string
 *      db:
 *        type: object
 *        properties:
 *          port:
 *            type: string
 *          name:
 *            type: string
 *      name:
 *        type: string
 *
 *  Engine-Server:
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
 *
 *  Configuration:
 *    type: object
 *    properties:
 *      db:
 *        $ref: '#/definitions/Database'
 *      activities:
 *        $ref: '#/definitions/Activities-Triggers'
 *      triggers:
 *        $ref: '#/definitions/Activities-Triggers'
 *      engine:
 *        $ref: '#/definitions/Engine-Server'
 *      stateServer:
 *        $ref: '#/definitions/Engine-Server'
 *      flowServer:
 *        $ref: '#/definitions/Engine-Server'
 */

/**
 * @swagger
 *  /configuration/reset:
 *    get:
 *      tags:
 *        - Configuration
 *      summary: Restart the engine with the default configuration options
 *      responses:
 *        200:
 *          description: Reset the configuration of the engine to its default values.
 *          schema:
 *            $ref: '#/definitions/Configuration-Reset'
 */
function* reset(next){

  try{
    resetConfiguration();
    this.body = config;

  }catch(err){
    this.throw(err.message, 500);
  }

  yield next;
}

/**
 * @swagger
 * definition:
 *  Configuration-Reset:
 *    type: object
 *    properties:
 *      db:
 *        type: string
 *      rootPath:
 *        type: string
 *      publicPath:
 *        type: string
 *      app:
 *        type: object
 *        properties:
 *          basePath:
 *            type: string
 *          port:
 *            type: number
 *          cacheTime:
 *            type: number
 *          gitRepoCachePath:
 *            type: string
 *      activities:
 *        type: object
 *        properties:
 *          bd:
 *            type: string
 *          defaultPath:
 *            type: string
 *          contribPath:
 *            type: string
 *          defatult:
 *            type: object
 *          contrib:
 *            type: object
 *      triggers:
 *        type: object
 *        properties:
 *          db:
 *            type: string
 *          defaultPath:
 *            type: string
 *          contribPath:
 *            type: string
 *          default:
 *            type: object
 *      models:
 *        type: object
 *        properties:
 *          db:
 *            type: string
 *          defaultPath:
 *            type: string
 *          contribPath:
 *            type: string
 *      testEngine:
 *        type: object
 *        properties:
 *          path:
 *            type: string
 *          name:
 *            type: string
 *          port:
 *            type: string
 *          installConfig:
 *            type: object
 *          triggers:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                settings:
 *                  type: object
 *                endpoints:
 *                  type: string
 *          config:
 *            type: object
 *            properties:
 *              loglevel:
 *                type: string
 *              disableTriggerValidation:
 *                type: boolean
 *              flowRunner:
 *                type: object
 *                properties:
 *                  type:
 *                    type: string
 *                  pooled:
 *                    type: object
 *                    properties:
 *                      numWorkers:
 *                        type: integer
 *                      workQueueSize:
 *                        type: integer
 *                      maxStepCpunt:
 *                        type: integer
 *              actionRunner:
 *                type: object
 *                properties:
 *                  type:
 *                    type: string
 *                  pooled:
 *                    type: object
 *                    properties:
 *                      numWorkers:
 *                        type: integer
 *                      workQueueSize:
 *                        type: integer
 *              services:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                    enabled:
 *                      type: boolean
 *                    settings:
 *                      type: object
 *                      properties:
 *                        host:
 *                          type: string
 *                        port:
 *                          type: string
 *      buildEngine:
 *        type: object
 *        properties:
 *          host:
 *            type: string
 *          port:
 *            type: string
 *          path:
 *            type: string
 *          name:
 *            type: string
 *          installConfig:
 *            type: object
 *          config:
 *            type: object
 *            properties:
 *              loglevel:
 *                type: string
 *              flowRunner:
 *                type: object
 *                properties:
 *                  type:
 *                    type: string
 *                  pooled:
 *                    type: object
 *                    properties:
 *                      numWorkers:
 *                        type: integer
 *                      workQueueSize:
 *                        type: integer
 *                      maxStepCount:
 *                        type: integer
 *              actionRunner:
 *                type: object
 *                properties:
 *                  type:
 *                    type: string
 *                  pooled:
 *                    type: object
 *                    properties:
 *                      numWorkers:
 *                        type: integer
 *                      workQueueSize:
 *                        type: integer
 *                      maxSteepCount:
 *                        type: integer
 *              services:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                    enabled:
 *                      type: boolean
 *                    settings:
 *                      type: object
 *                      properties:
 *                        host:
 *                          type: string
 *                        port:
 *                          type: string
 *      flogoWeb:
 *        type: object
 *        properties:
 *          protocol:
 *            type: string
 *          host:
 *            type: string
 *          port:
 *            type: string
 *          testPath:
 *            type: string
 *          label:
 *            type: string
 *      flogoWebActivities:
 *        type: object
 *        properties:
 *          protocol:
 *            type: string
 *          host:
 *            type: string
 *          port:
 *            type: string
 *          testPath:
 *            type: string
 *          label:
 *            type: string
 *      flogoWebTriggers:
 *        type: object
 *        properties:
 *          protocol:
 *            type: string
 *          host:
 *            type: string
 *          port:
 *            type: string
 *          testPath:
 *            type: string
 *          label:
 *            type: string
 *      stateServer:
 *        type: object
 *        properties:
 *          protocol:
 *            type: string
 *          host:
 *            type: string
 *          port:
 *            type: string
 *          testPath:
 *            type: string
 *      processServer:
 *        type: object
 *        properties:
 *          protocol:
 *            type: string
 *          host:
 *            type: string
 *          port:
 *            type: string
 *          testPath:
 *            type: string
 *      webServer:
 *        type: object
 *        properties:
 *          protocol:
 *            type: string
 *          host:
 *            type: string
 *          port:
 *            type: string
 *          testPath:
 *            type: string
 *      engine:
 *        type: object
 *        properties:
 *          protocol:
 *            type: string
 *          host:
 *            type: string
 *          port:
 *            type: string
 *          testPath:
 *            type: string
 */

/**
 * @swagger
 * /configuration:
 *    post:
 *      tags:
 *        - Configuration
 *      parameters:
 *        - name: configuration
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Configuration'
 *      responses:
 *        200:
 *          description: Change the current configuration of the engine.
 */
function* setConfiguration(next){

  try{
    let data = this.request.body.configuration||{};

    if(typeof this.request.body == 'string'){
      if(isJSON(this.request.body.configuration)){
        data = JSON.parse(this.request.body.configuration);
      }
    }

    console.log('The new configuration is:');
    console.log(data);
    setNewConfiguration(data);

    this.body = config;

  }catch(err){
    this.throw(err.message, 500);
  }

  yield next;
}

