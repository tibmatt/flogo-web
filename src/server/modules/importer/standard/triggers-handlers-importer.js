
import { AbstractTriggersHandlersImporter } from '../common/abstract-trigger-handlers-importer';

export class StandardTriggersHandlersImporter extends AbstractTriggersHandlersImporter {

  extractTriggers(rawApp) {
    return rawApp.triggers || [];
  }

  extractHandlers(trigger) {
    return trigger.handlers || [];
  }

}
