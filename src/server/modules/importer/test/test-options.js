import {AbstractActionsImporter} from "../common/abstract-actions-importer";
import {AbstractTriggersHandlersImporter} from "../common/abstract-trigger-handlers-importer";

export class TestOptions {
  constructor({updateTasksRefCb, depsConstructors}) {
    this.updateTasksRef = updateTasksRefCb || function(app) {
      return app;
    };
    this.depsConstructors = depsConstructors || {
      actionsImporter: AbstractActionsImporter,
      triggersHandlersImporter: AbstractTriggersHandlersImporter
    };
  }
}
