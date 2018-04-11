import {TriggerManager} from "../../../../modules/triggers";
import {ActivitiesManager} from "../../../../modules/activities";
import {getContribInstallationController as getInstallationController} from "../../../../modules/engine";
import {config} from "../../../../config/app-config";
import {logger} from "../../../../common/logging";
import {RemoteInstaller} from "../../../../modules/remote-installer";
import {DEFAULT_PATH_ACTIVITY, DEFAULT_PATH_TRIGGER, TYPE_ACTIVITY, TYPE_TRIGGER} from "../../../../common/constants";
import path from 'path';

const remoteInstaller = new RemoteInstaller();

const commonPath = 'contributions/microservices';

export function contribs(router, basePath) {
  router.get(`${basePath}/${commonPath}/triggers`, listTriggers);
  router.post(`${basePath}/${commonPath}/trigger`, installTrigger);
  router.get(`${basePath}/${commonPath}/activities`, listActivities);
  router.post(`${basePath}/${commonPath}/activity`, installActivity);
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
 *  /contributions/microservice/trigger:
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
  const filterName = this.request.query['filter[name]'];
  const filterRef = this.request.query['filter[ref]'];

  if (filterName) {
    searchTerms.name = filterName;
  }
  if (filterRef) {
    searchTerms.ref = filterRef;
  }

  const foundTriggers = yield TriggerManager.find(searchTerms);
  this.body = {
    data: foundTriggers || [],
  };
}

/**
 * @swagger
 * /contributions/microservice/triggers:
 *    post:
 *      tags:
 *        - Trigger
 *      summary: Install new Triggers in the engine
 *      parameters:
 *        - name: url
 *          in: body
 *          description: Url to the trigger to be installed
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Success or failure status of installing a trigger
 *          schema:
 *            type: object
 *            properties:
 *              success:
 *                type: array
 *                items: string
 *              fail:
 *                type: array
 *                items: string
 *        '400':
 *          description: Exception created while installing the trigger to the engine
 */
function* installTrigger(next) {
  this.req.setTimeout(0);
  const url = this.request.body.url;
  logger.info(`[log] Install Trigger: "${url}"`);

  const triggerRemoteInstaller = remoteInstaller.updateOptions({
    type: TYPE_TRIGGER,
    registerPath: path.join(config.rootPath, DEFAULT_PATH_TRIGGER)
  });

  const installController = yield getInstallationController(config.defaultEngine.path, triggerRemoteInstaller);

  const result = yield installController.install(url);

  delete result.details;

  this.body = result;

  yield next;
}

/**
 * @swagger
 * /contributions/microservice/activities:
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
 * /contributions/microservice/activity:
 *  post:
 *    tags:
 *      - Activity
 *    summary: Install new activities
 *    parameters:
 *      - name: url
 *        in: body
 *        description: Urls of the activities to be installed
 *        required: true
 *        schema:
 *          type: string
 *      responses:
 *        '200':
 *          description: Success or failure status of installing an activity
 *          schema:
 *            type: object
 *            properties:
 *              success:
 *                type: array
 *                items: string
 *              fail:
 *                type: array
 *                items: string
 *        '400':
 *          description: Exception created while installing the activity to the engine
 */
function* installActivity( next ) {
  this.req.setTimeout(0);
  const url = this.request.body.url;
  logger.info(`[log] Install Activity: "${url}"`);

  const activityRemoteInstaller = remoteInstaller.updateOptions({
    type: TYPE_ACTIVITY,
    registerPath: path.join(config.rootPath, DEFAULT_PATH_ACTIVITY)
  });

  const installController = yield getInstallationController(config.defaultEngine.path, activityRemoteInstaller);

  const result = yield installController.install(url);

  delete result.details;

  this.body = result;

  yield next;
}
