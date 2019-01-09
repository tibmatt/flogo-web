import { inject, injectable } from 'inversify';
import { TOKENS } from '../../../core';
import { HandlersService } from '../../apps/handlers-service';
import { AppTriggersService } from '../../apps/triggers';
import { ContributionsService } from '../../contribs';
import * as schemas from '../../schemas/v1.0.0';
import { extractContribRefs } from '../common/extract-contrib-refs';
import { loadMicroserviceContribs } from '../common/load-microservice-contribs';
import { validatorFactory } from '../validator';
import { StandardActionsImporter } from './standard-actions-importer';
import { StandardTaskConverter } from './standard-task-converter';
import { StandardTriggersHandlersImporter } from './standard-triggers-handlers-importer';
import { StrategyDependenciesFactory } from '../common';

@injectable()
export class StandardAppImporterFactory implements StrategyDependenciesFactory {
  constructor(
    @inject(TOKENS.ActionsManager)
    private actionsManager,
    @inject(TOKENS.ContribActivitiesManager)
    private contribActivitiesService: ContributionsService,
    @inject(TOKENS.ContribTriggersManager)
    private contribTriggersService: ContributionsService,
    private handlersService: HandlersService,
    private appTriggersService: AppTriggersService
  ) {}

  async create() {
    const contributions = await this.loadContributions();

    const validator = this.createValidator(contributions);

    const actionsImporter = this.createActionsImporter(
      this.actionsManager,
      contributions.activities
    );
    const triggersHandlersImporter = this.createTriggersHandlersImporter(
      this.appTriggersService,
      this.handlersService
    );
    return {
      actionsImporter,
      triggersHandlersImporter,
      validator,
    };
  }

  async loadContributions() {
    return loadMicroserviceContribs(
      this.contribActivitiesService,
      this.contribTriggersService
    );
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
    return new StandardActionsImporter(
      actionsManager,
      StandardTaskConverter,
      activitySchemas
    );
  }

  createTriggersHandlersImporter(appsTriggersManager, handlersManager) {
    return new StandardTriggersHandlersImporter(appsTriggersManager, handlersManager);
  }
}
