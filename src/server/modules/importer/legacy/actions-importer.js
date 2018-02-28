import { AbstractActionsImporter } from '../common/abstract-actions-importer';

export class ActionsImporter extends AbstractActionsImporter {

  extractActions(fromRawApp) {
    return fromRawApp.actions;
  }

}
