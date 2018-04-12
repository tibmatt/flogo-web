import {TriggerManager} from "../../../../modules/triggers";
import {ActivitiesManager} from "../../../../modules/activities";
import {getContribInstallationController as getInstallationController} from "../../../../modules/engine";
import {config} from "../../../../config/app-config";
import {logger} from "../../../../common/logging";
import {RemoteInstaller} from "../../../../modules/remote-installer";
import {DEFAULT_PATH_ACTIVITY, DEFAULT_PATH_TRIGGER, TYPE_ACTIVITY, TYPE_TRIGGER} from "../../../../common/constants";
import {ERROR_TYPES, ErrorManager} from "../../../../common/errors";
import path from 'path';
import flatten from 'lodash/flatten';

const remoteInstaller = new RemoteInstaller();

const contributionTypes = {
  "activity": {
    "manager": ActivitiesManager,
    "installerOpts": {
      "type": TYPE_ACTIVITY,
      "registerPath": path.join(config.rootPath, DEFAULT_PATH_ACTIVITY)
    }
  },
  "trigger": {
    "manager": TriggerManager,
    "installerOpts": {
      "type": TYPE_TRIGGER,
      "registerPath": path.join(config.rootPath, DEFAULT_PATH_TRIGGER)
    }
  }
};

export function contribs(router, basePath) {
  router.get(`${basePath}/contributions/microservices`, listContributions);
  router.post(`${basePath}/contributions/microservices`, installContribution);
}

/**
 * @swagger
 * definition:
 *  Contribution:
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
 *      settings:
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

/**
 * @swagger
 *  /contributions/microservice:
 *    get:
 *      tags:
 *        - Trigger
 *        - Activity
 *      summary: Get all the contributions installed in the engine.
 *      responses:
 *        '200':
 *          description: All contributions obtained successfully.
 *          schema:
 *            type: array
 *            items:
 *              $ref: '#/definitions/Contribution'
 */
function* listContributions() {
  const searchTerms = {};
  const filterName = this.request.query['filter[name]'];
  const filterRef = this.request.query['filter[ref]'];
  let contributionType = contributionTypes[this.request.query['filter[type]']];
  let foundContributions;

  if (filterName) {
    searchTerms.name = filterName;
  }
  if (filterRef) {
    searchTerms.ref = filterRef;
  }

  if (contributionType) {
    foundContributions = yield contributionType.manager.find(searchTerms);
  } else {
    const promises = Object.keys(contributionTypes)
      .reduce((promiseArray, type) =>  promiseArray.concat(contributionTypes[type].manager.find(searchTerms)), []);
    const results = yield Promise.all(promises);
    foundContributions = flatten(results);
  }

  this.body = {
    data: foundContributions || [],
  };
}

/**
 * @swagger
 * /contributions/microservice:
 *    post:
 *      tags:
 *        - Trigger
 *        - Activity
 *      summary: Install new Trigger or Activity to the engine
 *      parameters:
 *        - name: url
 *          in: body
 *          description: Url to the trigger to be installed
 *          required: true
 *          schema:
 *            type: string
 *        - name: type
 *          in: body
 *          description: Type of contribution to be installed. Should contain either 'activity' / 'trigger'
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Success or failure status of installing a contribution
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
 *          description: Exception created while installing the contribution to the engine
 */
function* installContribution(next) {
  this.req.setTimeout(0);
  const url = this.request.body.url;
  const contribType = contributionTypes[this.request.body.type];

  if (!contribType) {
    throw ErrorManager.createRestError('Unknown type of contribution', {
      type: ERROR_TYPES.ENGINE.INSTALL,
      message: "Unknown type of contribution",
      params: {
        body: "Should be in the pattern: {\"url\": \"path_to_contribution\", \"type\": \"activity\"}"
      }
    });
  }

  logger.info(`[log] Install ${contribType.installerOpts.type}: "${url}"`);
  const installController = yield getInstallationController(config.defaultEngine.path, remoteInstaller.updateOptions({
    ...contribType.installerOpts
  }));

  const result = yield installController.install(url);

  delete result.details;

  this.body = result;

  yield next;
}
