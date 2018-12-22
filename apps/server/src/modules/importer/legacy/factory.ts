import { inject, injectable } from 'inversify';
import { TOKENS } from '../../../core';
import { HandlersService } from '../../apps/handlers-service';
import { fullAppSchema } from '../../apps/schemas';
import { AppTriggersService } from '../../apps/triggers';
import { ContributionsService } from '../../contribs';
import { extractContribRefs } from '../common/extract-contrib-refs';
import { loadMicroserviceContribs } from '../common/load-microservice-contribs';
import { validatorFactory } from '../validator';
import { ActionsImporter } from './actions-importer';
import { TriggersHandlersImporter } from './triggers-handlers-importer';
import { StrategyDependenciesFactory } from '../common';

@injectable()
export class LegacyAppImporterFactory implements StrategyDependenciesFactory {
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
    const actionsImporter = this.createActionsImporter(
      this.actionsManager,
      contributions.activities
    );
    const triggersHandlersImporter = this.createTriggersHandlersImporter(
      this.appTriggersService,
      this.handlersService
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
      this.contribActivitiesService,
      this.contribTriggersService
    );
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
