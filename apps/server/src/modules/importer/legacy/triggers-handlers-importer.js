import { AbstractTriggersHandlersImporter } from '../common';

export class TriggersHandlersImporter extends AbstractTriggersHandlersImporter {
  extractTriggers(rawApp) {
    return rawApp.triggers || [];
  }

  extractHandlers(trigger) {
    return trigger.handlers || [];
  }
}
