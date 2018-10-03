import * as request from 'got';

import { config } from '../../../config/app-config';
import { logger } from '../../../common/logging';

let basePath = config.app.basePath;

const logRequestResponse = (request, response) => {
  logger.debug('Begin Request:');
  logger.debug('   URI:', request.uri);
  logger.debug('   Method:', request.method);
  logger.debug('   body:', request.body ? JSON.stringify(request.body, null, 2) : 'empty');
  logger.debug('End Request');
  logger.debug('Begin Response:');
  logger.debug('   ', JSON.stringify(response, null, 2));
  logger.debug('End Response\n');


};

export function flowsRun(router) {
  router.post('/flows/run/flows', flows);
  router.post('/flows/run/flow/start', flowStart);
  router.get('/flows/run/instances/:id/status', statusInstance);
  router.get('/flows/run/instances/:id/steps', stepsInstance);
  router.get('/flows/run/instances/:id', instanceById);
  router.get('/flows/run/instances/:idInstance/snapshot/:idSnapshot', getSnapshot);
  router.post('/flows/run/restart', restart);
  router.get('/flows/run/flows/:id', getProcessFlow);
}

/**
 * @swagger
 *'/flows/run/flows/{id}':
 *    get:
 *      tags:
 *        - Flow
 *      summary: Run specific flow
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          type: integer
 *      responses:
 *        '200':
 *          description: Success
 *          schema:
 *            type: object
 *            properties:
 *              attributes:
 *                type: array
 *                items:
 *                  type: object
 *              model:
 *                type: string
 *              name:
 *                type: string
 *              rootTask:
 *                type: object
 *                properties:
 *                  activityType:
 *                    type: string
 *                  id:
 *                    type: integer
 *                  links:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        from:
 *                          type: integer
 *                        id:
 *                          type: integer
 *                        to:
 *                          type: integer
 *                        type:
 *                          type: integer
 *                  name:
 *                    type: string
 *                  tasks:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        activityType:
 *                          type: string
 *                        attributes:
 *                          type: array
 *                          items:
 *                            $ref: '#/definitions/Attribute'
 *                        id:
 *                          type: integer
 *                        name:
 *                          type: string
 *                        type:
 *                          type: integer
 *                  type:
 *                    type: integer
 *              type:
 *                type: integer
 */
async function getProcessFlow(ctx, next) {
  let process = config.processServer;
  let id = ctx.params.id;
  let uri =  getUrl(process) + '/flows/' + id;
  ctx.body = id;

  try {
    let result = await request.get(uri);
    ctx.body = result.body;
    logRequestResponse({ uri, method: 'GET' }, ctx.body);
  }catch(err) {
    ctx.throw(err.message, 500);
  }

  next();
}

/**
 * @swagger
 *  /flows/run/restart:
 *    post:
 *      tags:
 *        - Flow
 *      summary: Restart flow execution
 *      parameters:
 *        - name: flowInfo
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              initialState:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                  state:
 *                    type: number
 *                  status:
 *                    type: number
 *                  attrs:
 *                    type: array
 *                    items:
 *                      type: object
 *                  flowUri:
 *                    type: string
 *                  workQueue:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: integer
 *                        execType:
 *                          type: integer
 *                        taskId:
 *                          type: integer
 *                        code:
 *                          type: integer
 *                  rootTaskEnv:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: integer
 *                      taskId:
 *                        type: integer
 *                      taskDatas:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            state:
 *                              type: integer
 *                            done:
 *                              type: boolean
 *                            attrs:
 *                              type: array
 *                              items:
 *                                type: object
 *                            taskId:
 *                              type: integer
 *                      linkDatas:
 *                        type: array
 *                        items:
 *                          type: object
 *                  actionUri:
 *                    type: string
 *              interceptor:
 *                type: object
 *                properties:
 *                  tasks:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: integer
 *                        inputs:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              name:
 *                                type: string
 *                              type:
 *                                type: string
 *                              value:
 *                                type: string
 *
 *      responses:
 *        '200':
 *          description: Success
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *                description: Execution ID
 */
async function restart(ctx, next) {
  let engine = config.engine;
  let data = ctx.request.body;

  let url = getUrl(engine) + '/flow/restart';

  try {
    let result = await request.post(url, { body: data, json: true });
    ctx.body = result.body;
    logRequestResponse({
      url,
      method: 'POST',
      body: data,
      json: true
    }, ctx.body);
  }catch(err) {
    ctx.throw(err.message, 500);
  }

  next();
}

/**
 * @swagger
 *'/flows/run/instances/{idInstance}/snapshot/{idSnapshot}':
 *    get:
 *      tags:
 *        - Flow
 *      summary: ...
 *      parameters:
 *        - name: idInstance
 *          in: path
 *          required: true
 *          type: string
 *          description: Flow execution ID
 *        - name: idSnapshot
 *          in: path
 *          required: true
 *          type: integer
 *          description: Snapshot ID
 *      responses:
 *        '200':
 *          description: ...
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *              state:
 *                type: number
 *              status:
 *                type: number
 *              attrs:
 *                type: array
 *                items:
 *                  type: object
 *              flowUri:
 *                type: string
 *              workQueue:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: number
 *                    execType:
 *                      type: number
 *                    taskId:
 *                      type: number
 *                    code:
 *                      type: number
 *              rootTask:
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                  taskId:
 *                    type: number
 *                  taskDatas:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        state:
 *                          type: number
 *                        done:
 *                          type: boolean
 *                        attrs:
 *                          type: array
 *                          items:
 *                            type: object
 *                        taskId:
 *                          type: integer
 *                  linkDatas:
 *                    type: array
 *                    items:
 *                      type: object
 */
async function getSnapshot(ctx, next) {
  let state = config.stateServer;
  let idInstance = ctx.params.idInstance;
  let idSnapshot = ctx.params.idSnapshot;

  let uri = getUrl(state) + '/instances/' + idInstance + '/snapshot/' + idSnapshot;

  try {
    let result = await request.get(uri);
    ctx.body = result.body;
    logRequestResponse({
      uri: uri,
      method: 'GET'
    }, ctx.body);
  }catch(err) {
    ctx.throw(err.message, 500);
  }

  next();
}

/**
 * @swagger
 *  /flows/run/instances/{id}:
 *    get:
 *      tags:
 *        - Flow
 *      summary: ...
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        type: string
 *      responses:
 *        200:
 *          description: tbd
 */
async function instanceById(ctx, next) {
  let state = config.stateServer;
  let id = ctx.params.id;
  let uri = getUrl(state) + '/instances/' + id;

  try {
    let result = await request.get(uri);
    ctx.body = result.body;
    logRequestResponse({
      uri,
      method: 'GET'
    }, ctx.body);
  }catch(err) {
    ctx.throw(err.message, 500);
  }

  next();
}

/**
 * @swagger
 *  '/flows/run/instances/{id}/steps':
 *    get:
 *      tags:
 *        - Flow
 *      summary: Flow execution steps
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          type: string
 *      responses:
 *        '200':
 *          description: Steps obtained successfully
 *          schema:
 *            $ref: '#/definitions/Step'
 */
async function stepsInstance(ctx, next) {
  let state = config.stateServer;
  let id = ctx.params.id;
  let uri = getUrl(state) + '/instances/' + id + '/steps';
  ctx.body = id;

  try {
    let result = await request.get(uri);
    ctx.body = result.body;
    logRequestResponse({
      uri,
      method: 'GET'
    }, ctx.body);
  }catch(err) {
    ctx.throw(err.message, 500);
  }

  next();
}
/**
 * @swagger
 * definition:
 *  Step:
 *    type: object
 *    properties:
 *      flow:
 *        type: object
 *        properties:
 *          attributes:
 *            type: array
 *            items:
 *              $ref: '#/definitions/Attribute'
 *          state:
 *            type: number
 *          status:
 *            type: number
 *      id:
 *        type: string
 *      taskId:
 *        type: number
 *      tasks:
 *        type: string
 */

/**
 * @swagger
 * definition:
 *  Attribute:
 *    type: object
 *    required: [ name, type ]
 *    properties:
 *      name:
 *        type: string
 *      type:
 *        type: string
 *      value:
 *        type: string
 *      required:
 *        type: boolean
 *        description: Just required when the value is true
 *      allowed:
 *        type: array
 *        description: An array of the possible options
 *        items:
 *          type: string
 */

/**
 * @swagger
 *  '/flows/run/instances/{flowId}/status':
 *    get:
 *      tags:
 *        - Flow
 *      summary: Get the current execution status
 *      parameters:
 *        - name: flowId
 *          in: path
 *          required: true
 *          type: string
 *          description: This ID of the flow's execution obtained at 'flows/run/flow/start'
 *      responses:
 *        '200':
 *          description: Execution status obtained successfully
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *              status:
 *                type: integer
 */
async function statusInstance(ctx, next) {
  let state = config.stateServer;
  let id = ctx.params.id;
  let uri =  getUrl(state) + '/instances/' + id + '/status';
  ctx.body = id;

  try {
    let result = await request.get(uri);
    ctx.body = result.body;
    logRequestResponse({
      uri,
      method: 'GET'
    }, ctx.body);
  }catch(err) {
    ctx.throw(err.message, 500);
  }

  next();
}

function getUrl(service) {
  let url = service.protocol + '://' + service.host;

  if(service.port) {
    url += ':' + service.port
  }
  if(service.basePath){
    url += service.basePath;
  }
  return url;
}

/**
 * @swagger
 *   /flows/run/flow/start:
 *    post:
 *      tags:
 *        - Flow
 *      summary: Starts the flow execution
 *      parameters:
 *        - name: flowInfo
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              flowId:
 *                type: number
 *              attrs:
 *                type: array
 *                items:
 *                  type: object
 *      responses:
 *        '200':
 *          description: Flow executed successfully
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *                description: flow id
 */
async function flowStart(ctx, next) {
  let data = ctx.request.body;
  let engine = config.engine;
  let process = config.processServer;

  let uri = getUrl(engine) + '/flow/start';
  data.actionUri =  getUrl(process) + '/flows/' + data.flowId;
  data.flowUri = data.actionUri;
  delete data.flowId;

  try {
      let result = await request.post(uri, { body: data, json: true });
      ctx.body = result.body;
      logRequestResponse( {
        uri,
        method: 'POST',
        body: data,
        json: true
      }, ctx.body);
  }catch (err) {
    ctx.throw(err.message, 500);
  }

  next();

}

/**
 * @swagger
 *  /flows/run/flows:
 *    post:
 *      tags:
 *        - Flow
 *      summary: Run a flow
 *      parameters:
 *        - name: flowInfo
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              description:
 *                type: string
 *                description: Flow's description
 *              flow:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                  model:
 *                    type: string
 *                  type:
 *                    type: number
 *                  attributes:
 *                    type: array
 *                    items:
 *                      type: string
 *                  rootTask:
 *                    type: object
 *                    allOf:
 *                    - $ref: '#/definitions/Task'
 *                    - properties:
 *                        tasks:
 *                          type: array
 *                          items:
 *                            type: object
 *                            allOf:
 *                            - $ref: '#/definitions/Task'
 *                            - properties:
 *                                attributes:
 *                                  type: array
 *                                  items:
 *                                    type: object
 *                                    properties:
 *                                      name:
 *                                        type: string
 *                                      value:
 *                                        type: string
 *                                      type:
 *                                        type: string
 *                        links:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              id:
 *                                type: number
 *                              from:
 *                                type: number
 *                              to:
 *                                type: number
 *                              type:
 *                                type: number
 *
 *              name:
 *                type: string
 *                description: Flow's name
 *
 *      responses:
 *        '200':
 *          description: Successful run execution
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: Flow's name
 *              description:
 *                type: string
 *                description: Flow's description
 *              id:
 *                type: integer
 *              creationDate:
 *                type: string
 *                format: dateTime
 */
async function flows(ctx, next) {
  let data = ctx.request.body;
  let process = config.processServer;
  let uri = getUrl(process) + '/flows';

  try {
    let result = await request.post(uri, { body: data, json: true });
    ctx.body = result.body;
    logRequestResponse({
      uri,
      method: 'POST',
      body: data,
      json: true
    }, ctx.body);
  } catch(err) {
    ctx.throw(err.message, 500);
  }

  next();
}
/**
 * @swagger
 * definition:
 *  Task:
 *    type: object
 *    properties:
 *      id:
 *        type: number
 *      type:
 *        type: number
 *      activityType:
 *        type: string
 *      name:
 *        type: string
 */


