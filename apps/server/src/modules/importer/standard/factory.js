import * as schemas from '../../schemas/v1.0.0';

import { loadMicroserviceContribs } from '../common/load-microservice-contribs';
import { validatorFactory } from '../validator';

import { extractContribRefs } from '../common/extract-contrib-refs';

import { StandardActionsImporter } from './standard-actions-importer';
import { StandardTaskConverter } from './standard-task-converter';
import { StandardTriggersHandlersImporter } from './standard-triggers-handlers-importer';

export class StandardAppImporterFactory {
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
      contributions.activities
    );
    const triggersHandlersImporter = this.createTriggersHandlersImporter(
      this.resourceStorageRegistry.getAppsTriggersManager(),
      this.resourceStorageRegistry.getHandlersManager()
    );
    return {
      actionsImporter,
      triggersHandlersImporter,
      validator,
    };
  }

  async loadContributions() {
    return loadMicroserviceContribs(this.getActivitiesManager(), this.getTriggersManager());
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
    return validatorFactory(schemas.app, contribRefs, {
      schemas: [schemas.common, schemas.trigger, schemas.flow],
    });
  }

  createActionsImporter(actionsManager, activitySchemas) {
    return new StandardActionsImporter(actionsManager, StandardTaskConverter, activitySchemas);
  }

  createTriggersHandlersImporter(appsTriggersManager, handlersManager) {
    return new StandardTriggersHandlersImporter(appsTriggersManager, handlersManager);
  }
}
