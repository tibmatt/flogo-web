import groupBy from 'lodash/groupBy';

import { fullDeviceAppSchema } from '../../apps/schemas';

import { validatorFactory } from '../validator';
import { extractContribRefs } from '../common/extract-contrib-refs';

import { ActionsImporter } from './actions-importer';
import { TriggersHandlersImporter } from './triggers-handlers-importer';

export class DeviceAppImporterFactory {

  /**
   * @param {ResourceStorageRegistry} resourceStorageRegistry
   */
  constructor(resourceStorageRegistry) {
    this.resourceStorageRegistry = resourceStorageRegistry;
  }

  async create() {
    const contributions = await this.loadContributions();
    const validator = this.createValidator(contributions);

    const actionsImporter = this.createActionsImporter(
      this.resourceStorageRegistry.getActionsManager(),
      contributions.activities,
    );

    const triggersHandlersImporter = this.createTriggersHandlersImporter(
      this.resourceStorageRegistry.getAppsTriggersManager(),
      this.resourceStorageRegistry.getHandlersManager(),
      contributions.triggers,
    );

    return {
      actionsImporter,
      triggersHandlersImporter,
      validator,
    };
  }

  createTriggersHandlersImporter(appsTriggersManager, handlersManager, triggers) {
    return new TriggersHandlersImporter(appsTriggersManager, handlersManager, triggers);
  }

  createActionsImporter(actionsManager, activities) {
    return new ActionsImporter(actionsManager, activities);
  }

  getContribDeviceManager() {
    return this.resourceStorageRegistry.getDeviceContribsManager();
  }

  async loadContributions() {
    return this.getContribDeviceManager()
      .find()
      .then(contribs => groupBy(contribs, 'type'))
      .then(contribGroups => ({
        activities: contribGroups['flogo:device:activity'] || [],
        triggers: contribGroups['flogo:device:trigger'] || [],
      }));
  }

  createValidator(contributions) {
    const contribRefs = {
      activities: extractContribRefs(contributions.activities),
      triggers: extractContribRefs(contributions.triggers),
    };
    return validatorFactory(fullDeviceAppSchema, contribRefs);
  }

}
