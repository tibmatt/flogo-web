import { fullAppSchema } from '../../apps/schemas';

import { validatorFactory } from '../validator';

import { extractContribRefs } from '../extract-contrib-refs';

import { StandardActionsImporter } from './actions-importer';
import { StandardTriggersHandlersImporter } from './triggers-handlers-importer';

export class LegacyAppImporterFactory {

  /**
   * @param {ResourceStorageRegistry} resourceStorageRegistry
   */
  constructor(resourceStorageRegistry) {
    this.resourceStorageRegistry = resourceStorageRegistry;
  }

  async create() {
    const actionsImporter = this.createActionsImporter(
      this.resourceStorageRegistry.getActionsManager(),
    );
    const triggersHandlersImporter = this.createTriggersHandlersImporter(
      this.resourceStorageRegistry.getAppsTriggersManager(),
      this.resourceStorageRegistry.getHandlersManager(),
    );
    const contributions = await this.loadContributions();
    const validator = this.createValidator(contributions);
    return {
      actionsImporter,
      triggersHandlersImporter,
      validator,
    };
  }

  async loadContributions() {
    const [activities, triggers] = await Promise.all([
      this.getActivitiesManager().find(),
      this.getTriggersManager().find(),
    ]);
    return { activities, triggers };
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

  createActionsImporter(actionsManager) {
    return new StandardActionsImporter(actionsManager);
  }

  createTriggersHandlersImporter(appsTriggersManager, handlersManager) {
    return new StandardTriggersHandlersImporter(appsTriggersManager, handlersManager);
  }
}
