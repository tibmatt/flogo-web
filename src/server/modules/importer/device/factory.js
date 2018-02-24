import groupBy from 'lodash/groupBy';

import { validatorFactory } from '../validator';

import { HandlersManager } from '../../apps/handlers';
import { ActionsManager } from '../../actions/index';
import { AppsTriggersManager } from '../../apps/triggers';
import { fullDeviceAppSchema } from '../../apps/schemas';
import { ContribsManager as ContribDeviceManager } from '../../contribs';

import { extractContribRefs } from '../extract-contrib-refs';

import { ActionsImporter } from './actions-importer';
import { TriggersHandlersImporter } from './triggers-handlers-importer';

export class DeviceAppImporterFactory {

  static async create() {
    const contributions = await this.loadContributions();
    const validator = this.createValidator(contributions);

    const actionsImporter = new ActionsImporter(ActionsManager, contributions.activities);
    const triggersHandlersImporter = new TriggersHandlersImporter(
      AppsTriggersManager, HandlersManager, contributions.triggers,
    );

    return {
      actionsImporter,
      triggersHandlersImporter,
      validator,
    };
  }

  static async loadContributions() {
    return ContribDeviceManager
      .find()
      .then(contribs => groupBy(contribs, 'type'))
      .then(contribGroups => ({
        activities: contribGroups['flogo:device:activity'] || [],
        triggers: contribGroups['flogo:device:trigger'] || [],
      }));
  }

  static createValidator(contributions) {
    const contribRefs = extractContribRefs(contributions);
    return validatorFactory(fullDeviceAppSchema, contribRefs);
  }

}
