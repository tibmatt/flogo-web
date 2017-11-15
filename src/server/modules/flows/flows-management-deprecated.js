import defaults from 'lodash/defaults';
import get from 'lodash/get';
import uniqBy from 'lodash/uniqBy';

import { flowsDBService } from '../../config/app-config';
import { FLOGO_TASK_TYPE, DEFAULT_APP_ID } from '../../common/constants';

import { ActivitiesManager } from '../../modules/activities';
import { TriggerManager } from '../../modules/triggers';

const _dbService = flowsDBService;

/**
 * @deprecated
 */
export class FlowsManagementDeprecated {

  /**
   * @deprecated
   */
  static createFlow(flowData) {
    let data = flowData;

    const defaultFlowData = {
      name: 'Unnamed',
      description: '',
      paths: {},
      items: {},
    };

    // TODO: does not need to load activities and triggers if imported flow does not have them
    return Promise.all([
      getActivities(),
      getTriggers(),
    ])
      .then((connectors) => {
        const [activities, triggers] = connectors;
        defaults(data, defaultFlowData);
        data._id = _dbService.generateFlowID();
        data.$table = _dbService.getIdentifier('FLOW');
        delete data._rev;

        // TODO: validate appId exists
        if (!data.appId) {
          data.appId = DEFAULT_APP_ID;
        }

        return validateFlow(data, activities, triggers);
      })
      .then(res => {
        console.log('CREATING with ', data);
        if (res.status == 200) {
          return _dbService.createFlow(data)
            .then((createFlowResult) => ({ status: res.status, details: createFlowResult }))
            .catch(err => Promise.reject({ status: err.status || 500, details: err.details }));
        }
        return res;
      });
  }

  static updateFlow(flowObj) {
    delete flowObj.app;
    return _dbService.update(Object.assign({ appId: DEFAULT_APP_ID }, flowObj));
  }

}


function validateFlow(flow, activities, triggers) {
  return new Promise((resolve, reject) => {
    let validateErrors = [];

    try {
      validateErrors = validateTriggersAndActivities(flow, triggers, activities);
    } catch (err) {
      resolve({ status: 500, details: err });
    }
    if (validateErrors.hasErrors) {
      const details = {
        details: {
          message: 'Flow could not be created/imported, missing triggers/activities',
          activities: validateErrors.activities,
          triggers: validateErrors.triggers,
          ERROR_CODE: 'ERROR_VALIDATION',
        },
      };
      reject({ status: 400, details });
    } else {
      resolve({ status: 200 });
    }
  });
}

function validateTriggersAndActivities(flow, triggers, activities) {
  const validate = { activities: [], triggers: [], hasErrors: false };

  try {
    const installedTiles = triggers.concat(activities);
    const tilesMainFlow = getTilesFromFlow(get(flow, 'items', []));
    const tilesErrorFlow = getTilesFromFlow(get(flow, 'errorHandler.items', []));
    const allTilesFlow = uniqBy(
      tilesMainFlow.concat(tilesErrorFlow),
      (elem) => elem.name + elem.type,
    );

    allTilesFlow.forEach((tile) => {
      const index = installedTiles.findIndex((installed) => {
        return installed.name === tile.name && installed.type === tile.type;
      });

      if (index === -1) {
        validate.hasErrors = true;
        if (tile.type === FLOGO_TASK_TYPE.TASK_ROOT) {
          validate.triggers.push(tile.name);
        } else {
          validate.activities.push(tile.name);
        }
      }
    });
  } catch (err) {
    this.throw(err);
  }

  return validate;
}


function getTilesFromFlow(items) {
  const tiles = [];

  for (var key in items) {
    const item = items[key];
    const isRootOrTask = item.type === FLOGO_TASK_TYPE.TASK_ROOT || item.type === FLOGO_TASK_TYPE.TASK;
    const isErrorRoot = item.triggerType && item.triggerType === '__error-trigger';
    if (isRootOrTask && !isErrorRoot) {
      const tile = {
        type: item.type,
        name: item.triggerType || item.activityType,
        homepage: item.homepage || '',
      };
      const index = tiles.findIndex(obj => tile.type === obj.type && tile.name === obj.name);
      if (index === -1) {
        tiles.push(tile);
      }
    }
  }

  return tiles;
}

export function getActivities() {
  return ActivitiesManager.find(null)
    .then(activities => activities.map(
      activity => ({ name: activity._id, type: FLOGO_TASK_TYPE.TASK })),
    );
}

export function getTriggers() {
  return TriggerManager.find(null, { fields: 'raw' })
    .then(triggers => triggers.map(
      trigger => ({ name: trigger._id, type: FLOGO_TASK_TYPE.TASK_ROOT })),
    );
}

