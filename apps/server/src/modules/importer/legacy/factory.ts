import { fullAppSchema } from '../../apps/schemas';
import { ResourceStorageRegistry } from '../../resource-storage-registry';

import { validatorFactory } from '../validator';

import { extractContribRefs } from '../common/extract-contrib-refs';

import { ActionsImporter } from './actions-importer';
import { TriggersHandlersImporter } from './triggers-handlers-importer';
import { loadMicroserviceContribs } from '../common/load-microservice-contribs';

export class LegacyAppImporterFactory {
  constructor(private resourceStorageRegistry: ResourceStorageRegistry) {}

  async create() {
    const contributions = await this.loadContributions();
    const actionsImporter = this.createActionsImporter(
      this.resourceStorageRegistry.getActionsManager(),
      contributions.activities
    );
    const triggersHandlersImporter = this.createTriggersHandlersImporter(
      this.resourceStorageRegistry.getAppsTriggersManager(),
      this.resourceStorageRegistry.getHandlersManager()
    );
    const validator = this.createValidator(contributions);
    return {
      actionsImporter,
      triggersHandlersImporter,
      validator,
    };
  }

  async loadContributions() {
    return loadMicroserviceContribs(
      this.getActivitiesManager(),
      this.getTriggersManager()
    );
  }

  getTriggersManager() {
    return this.resourceStorageRegistry.getContribTriggersManager();
  }

  getActivitiesManager() {
    return this.resourceStorageRegistry.getContribActivitiesManager();
  }

  createValidator(contributions) {
    const contribRefs = {
      activities: extractContribRefs(contributions.activities),
      triggers: extractContribRefs(contributions.triggers),
    };
    return validatorFactory(fullAppSchema, contribRefs);
  }

  createActionsImporter(actionsManager, activities) {
    return new ActionsImporter(actionsManager, activities);
  }

  createTriggersHandlersImporter(appsTriggersManager, handlersManager) {
    return new TriggersHandlersImporter(appsTriggersManager, handlersManager);
  }
}
