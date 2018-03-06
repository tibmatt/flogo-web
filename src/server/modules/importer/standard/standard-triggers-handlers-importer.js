import { AbstractTriggersHandlersImporter } from '../common/abstract-trigger-handlers-importer';
import { convertMappingsCollection, parseResourceIdFromResourceUri } from './utils';

export class StandardTriggersHandlersImporter extends AbstractTriggersHandlersImporter {

  extractTriggers(rawApp) {
    const standardTriggers = rawApp.triggers || [];
    return standardTriggers.map(stdTrigger => ({
      ...stdTrigger,
      name: stdTrigger.name || stdTrigger.id,
    }));
  }

  extractHandlers(trigger) {
    const standardHandlers = trigger.handlers || [];
    return standardHandlers.map(stdHandler => this.mapHandler(stdHandler));
  }

  mapHandler(stdHandler) {
    const action = stdHandler.action;
    return {
      settings: stdHandler.settings,
      actionId: parseResourceIdFromResourceUri(action.data.flowURI),
      actionMappings: convertMappingsCollection(action.mappings),
    };
  }

}
