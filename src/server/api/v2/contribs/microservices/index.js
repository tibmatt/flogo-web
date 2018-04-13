import {TriggerManager} from "../../../../modules/triggers";
import {ActivitiesManager} from "../../../../modules/activities";
import {getContribInstallationController as getInstallationController} from "../../../../modules/engine";
import {config} from "../../../../config/app-config";
import {logger} from "../../../../common/logging";
import {RemoteInstaller} from "../../../../modules/remote-installer";
import {TYPE_ACTIVITY, TYPE_TRIGGER} from "../../../../common/constants";
import {ERROR_TYPES, ErrorManager} from "../../../../common/errors";
import flatten from 'lodash/flatten';

const remoteInstaller = new RemoteInstaller();

const contributionTypes = {
  "activity": {
    "manager": ActivitiesManager,
    "installerOpts": {
      "type": TYPE_ACTIVITY
    }
  },
  "trigger": {
    "manager": TriggerManager,
    "installerOpts": {
      "type": TYPE_TRIGGER
    }
  }
};

export function contribs(router, basePath) {
  router.get(`${basePath}/contributions/microservices`, listContributions);
  router.post(`${basePath}/contributions/microservices`, installContribution);
}

/**
 * Get all the contributions installed in the engine. The request have following optional query params:
 * filter[name] {string} name of the contribution which needs to be fetched.
 * filter[ref] {string} reference of the contribution which needs to be fetched.
 * filter[type] {string} can contain 'activity' or 'trigger' to fetch all contributions of one type.
 *                       If nothing provided, all the contributions for a microservices will be returned
 *
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
    const contributionsFetcher = Object.keys(contributionTypes)
      .reduce((getContribsArray, type) =>  getContribsArray.concat(contributionTypes[type].manager.find(searchTerms)), []);
    const results = yield Promise.all(contributionsFetcher);
    foundContributions = flatten(results);
  }

  this.body = {
    data: foundContributions || [],
  };
}

/**
 * Install new Trigger or Activity to the engine. The POST request need to have the following properties in the body:
 * url {string} Url to the contribution to be installed
 * type {string} Type of contribution to be installed. Should contain either 'activity' / 'trigger'
 *
 */
function* installContribution(next) {
  this.req.setTimeout(0);
  const url = this.request.body.url;
  const contribType = contributionTypes[this.request.body.type];

  if (!contribType) {
    throw ErrorManager.createRestError('Unknown type of contribution', {
      type: ERROR_TYPES.ENGINE.INSTALL,
      message: 'Unknown type of contribution',
      params: {
        body: 'Should be in the pattern: {"url": "path_to_contribution", "type": "activity"}'
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
