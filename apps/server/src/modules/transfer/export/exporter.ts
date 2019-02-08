import { isEmpty, compact } from 'lodash';

import { forEachSubflowTaskInAction } from '@flogo-web/server/core';

import { Validator } from '../../../common/validator';
import { DEFAULT_APP_TYPE, DEFAULT_APP_VERSION } from '../../../common/constants';
import { normalizeName } from './utils/normalize-name';
import { DanglingSubflowReferencesCleaner } from './utils/dangling-subflow-references-cleaner';
import { UniqueIdAgent } from './utils/unique-id-agent';
import { StandardMicroServiceFormatter } from './formatters/standard-microservice-formatter';

export class Exporter {
  constructor(
    private isFullAppExportMode: boolean,
    private formatter: StandardMicroServiceFormatter,
    private validator: Validator,
    private uniqueIdAgent: UniqueIdAgent
  ) {}

  /**
   *
   * @param onlyFlows
   * @throws validation error
   * @return {*}
   */
  export(app, onlyFlows) {
    if (!this.isFullAppExportMode) {
      app.actions = this.selectActions(app.actions, onlyFlows);
    }
    app = this.formatter.preprocess(app);

    app = this.applyDefaultAppAttributes(app);

    const { actions, previousActionIdsLinker } = this.humanizeActionIds(app.actions);
    app.actions = this.updateSubflowReferencesAndDanglingMappings(
      actions,
      previousActionIdsLinker
    );

    app.triggers = this.processTriggers(app.triggers, previousActionIdsLinker);

    app = this.formatter.format(app);

    this.validator.validate(app);
    app = this.postProcess(app);
    return app;
  }

  updateSubflowReferencesAndDanglingMappings(actions, previousActionIdsLinker) {
    const subflowMappingCleaner = new DanglingSubflowReferencesCleaner();
    const updateTask = task => {
      const linkedAction = previousActionIdsLinker.get(task.settings.flowPath);
      task.settings.flowPath = linkedAction ? linkedAction.id : null;
      task.inputMappings = subflowMappingCleaner.cleanMappings(task, linkedAction);
    };
    return actions.map(action => {
      forEachSubflowTaskInAction(action, updateTask);
      return action;
    });
  }

  selectActions(actions, includeOnlyThisActionIds = []) {
    if (isEmpty(includeOnlyThisActionIds)) {
      return actions;
    }
    const actionRegistry = new Map(actions.map(action => [action.id, action]));

    const finalActionIds = new Set(includeOnlyThisActionIds);
    const collectSubflowPathFromTask = task => finalActionIds.add(task.settings.flowPath);

    includeOnlyThisActionIds.forEach(actionId => {
      const action = actionRegistry.get(actionId);
      if (action) {
        forEachSubflowTaskInAction(action, collectSubflowPathFromTask);
      }
    });

    return compact(
      Array.from(finalActionIds.values()).map(actionId => actionRegistry.get(actionId))
    );
  }

  processTriggers(triggers, humanizedActions) {
    if (this.isFullAppExportMode) {
      const {
        triggers: humanizedTriggers,
        handlers,
      } = this.humanizeTriggerNamesAndExtractHandlers(triggers);
      triggers = humanizedTriggers;
      this.reconcileHandlersAndActions(handlers, humanizedActions);
    } else {
      triggers = [];
    }
    return triggers;
  }

  postProcess(app) {
    if (!this.isFullAppExportMode) {
      app.type = 'flogo:actions';
      delete app.triggers;
    }
    return app;
  }

  applyDefaultAppAttributes(app) {
    if (!app.version) {
      app.version = DEFAULT_APP_VERSION;
    }
    app.type = DEFAULT_APP_TYPE;
    return app;
  }

  humanizeActionIds(actions) {
    const previousActionIdsLinker = new Map();
    actions.forEach(action => {
      const oldId = action.id;
      action.id = this.uniqueIdAgent.generateUniqueId(action.name);
      previousActionIdsLinker.set(oldId, action);
    });
    return { actions, previousActionIdsLinker };
  }

  humanizeTriggerNamesAndExtractHandlers(triggers) {
    let handlers = [];
    triggers.forEach(t => {
      t.id = normalizeName(t.name);
      handlers = handlers.concat(t.handlers);
    });
    return { triggers, handlers };
  }

  reconcileHandlersAndActions(handlers, humanizedActions) {
    handlers.forEach(h => {
      const oldActionId = h.actionId;
      const action = humanizedActions.get(oldActionId);
      if (!action) {
        delete h.actionId;
        return;
      }
      h.actionId = action.id;
    });
  }
}
