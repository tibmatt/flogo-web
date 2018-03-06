import { AbstractActionsImporter } from '../common';

export class ActionsImporter extends AbstractActionsImporter {

  extractActions(fromRawApp) {
    return fromRawApp.actions;
  }

}
