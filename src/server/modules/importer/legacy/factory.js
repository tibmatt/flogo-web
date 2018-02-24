import { Validator, validatorFactory } from '../validator';

import { HandlersManager } from '../../apps/handlers';
import { ActionsManager } from '../../actions/index';
import { AppsTriggersManager } from '../../apps/triggers';
import { fullAppSchema } from '../../apps/schemas';

import { TriggerManager as ContribTriggersManager } from '../../triggers';
import { ActivitiesManager as ContribActivitiesManager } from '../../activities';

import { extractContribRefs } from '../extract-contrib-refs';

import { ActionsImporter } from './actions-importer';
import { TriggersHandlersImporter } from './triggers-handlers-importer';

export class LegacyAppImporterFactory {

  static async create() {
    const actionsImporter = new ActionsImporter(ActionsManager);
    const triggersHandlersImporter = new TriggersHandlersImporter(AppsTriggersManager, HandlersManager);
    const contributions = await this.loadContributions();
    const validator = this.createValidator(contributions);
    return {
      actionsImporter,
      triggersHandlersImporter,
      validator,
    };
  }

  static async loadContributions() {
    const [activities, triggers] = await Promise.all([
      ContribTriggersManager.find(),
      ContribActivitiesManager.find(),
    ]);
    return { activities, triggers };
  }

  static createValidator(contributions) {
    const contribRefs = extractContribRefs(contributions);
    return validatorFactory(fullAppSchema, contribRefs);
  }

}
