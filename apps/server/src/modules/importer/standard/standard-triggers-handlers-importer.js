import { AbstractTriggersHandlersImporter } from '../common/abstract-trigger-handlers-importer';
import { convertMappingsCollection, parseResourceIdFromResourceUri } from './utils';

export class StandardTriggersHandlersImporter extends AbstractTriggersHandlersImporter {
  extractTriggers(rawApp) {
    return rawApp.triggers || [];
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
