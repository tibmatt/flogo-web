import { AbstractActionsImporter } from '../common/abstract-actions-importer';
import { AbstractTriggersHandlersImporter } from '../common/abstract-trigger-handlers-importer';

export class TestOptions {
  updateTasksRef: Function;
  depsConstructors: {
    actionsImporter: AbstractActionsImporter;
    triggersHandlersImporter: AbstractTriggersHandlersImporter;
  };
  expectedActions: any[];
  expectedTriggers: any[];
  expectedReconciledTriggers: any[];
  constructor({
    updateTasksRefCb,
    depsConstructors,
    expectedActions,
    expectedTriggers,
    expectedReconciledTriggers,
  }) {
    this.updateTasksRef =
      updateTasksRefCb ||
      function(app) {
        return app;
      };
    this.depsConstructors = depsConstructors || {
      actionsImporter: AbstractActionsImporter,
      triggersHandlersImporter: AbstractTriggersHandlersImporter,
    };
    this.expectedActions = expectedActions || [];
    this.expectedTriggers = expectedTriggers || [];
    this.expectedReconciledTriggers = expectedReconciledTriggers || [];
  }
}
