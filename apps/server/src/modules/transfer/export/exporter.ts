import { isEmpty, compact } from 'lodash';

import { forEachSubflowTaskInAction, Resource } from '@flogo-web/server/core';

import { DEFAULT_APP_TYPE, DEFAULT_APP_VERSION } from '../../../common/constants';
import { normalizeName } from './utils/normalize-name';
import { DanglingSubflowReferencesCleaner } from './utils/dangling-subflow-references-cleaner';
import { UniqueIdAgent } from './utils/unique-id-agent';
import { AppFormatter } from './app-formatter';

export class Exporter {
  constructor(
    private isFullAppExportMode: boolean,
    private formatter: AppFormatter,
    private uniqueIdAgent: UniqueIdAgent
  ) {}

  /**
   * @throws validation error
   */
  export(app, onlyThisResources?: string[]) {
    // todo: re-enable resource selection
    // if (!this.isFullAppExportMode) {
    //   app.actions = this.selectResources(app.actions, onlyThisResources);
    // }

    app = this.applyDefaultAppAttributes(app);

    const { resources, previousResourceIdsLinker } = this.humanizeResourceIds(
      app.actions
    );
    // app.actions = this.updateSubflowReferencesAndDanglingMappings(
    //   resources,
    //   previousResourceIdsLinker
    // );

    app.triggers = this.processTriggers(app.triggers, previousResourceIdsLinker);

    app = this.formatter.format(app);

    // this.validator.validate(app);
    app = this.postProcess(app);
    return app;
  }

  // updateSubflowReferencesAndDanglingMappings(actions, previousActionIdsLinker) {
  //   const subflowMappingCleaner = new DanglingSubflowReferencesCleaner();
  //   const updateTask = task => {
  //     const linkedAction = previousActionIdsLinker.get(task.settings.flowPath);
  //     task.settings.flowPath = linkedAction ? linkedAction.id : null;
  //     task.inputMappings = subflowMappingCleaner.cleanMappings(task, linkedAction);
  //   };
  //   return actions.map(action => {
  //     forEachSubflowTaskInAction(action, updateTask);
  //     return action;
  //   });
  // }

  // selectResources(resources, includeOnlyThisActionIds = []) {
  //   if (isEmpty(includeOnlyThisActionIds)) {
  //     return resources;
  //   }
  //   const actionRegistry = new Map(resources.map(action => [action.id, action]));
  //
  //   const finalActionIds = new Set(includeOnlyThisActionIds);
  //   const collectSubflowPathFromTask = task => finalActionIds.add(task.settings.flowPath);
  //
  //   includeOnlyThisActionIds.forEach(actionId => {
  //     const action = actionRegistry.get(actionId);
  //     if (action) {
  //       forEachSubflowTaskInAction(action, collectSubflowPathFromTask);
  //     }
  //   });
  //
  //   return compact(
  //     Array.from(finalActionIds.values()).map(actionId => actionRegistry.get(actionId))
  //   );
  // }

  processTriggers(triggers, humanizedActions) {
    if (this.isFullAppExportMode) {
      const {
        triggers: humanizedTriggers,
        handlers,
      } = this.humanizeTriggerNamesAndExtractHandlers(triggers);
      triggers = humanizedTriggers;
      this.reconcileHandlersAndResources(handlers, humanizedActions);
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

  humanizeResourceIds(
    resources: Resource[]
  ): {
    resources: Resource[];
    previousResourceIdsLinker: Map<string, string>;
  } {
    const previousResourceIdsLinker = new Map();
    resources.forEach(resource => {
      const oldId = resource.id;
      resource.id = this.uniqueIdAgent.generateUniqueId(resource.name);
      previousResourceIdsLinker.set(oldId, resource);
    });
    return { resources, previousResourceIdsLinker };
  }

  humanizeTriggerNamesAndExtractHandlers(triggers) {
    let handlers = [];
    triggers.forEach(t => {
      t.id = normalizeName(t.name);
      handlers = handlers.concat(t.handlers);
    });
    return { triggers, handlers };
  }

  reconcileHandlersAndResources(handlers, humanizedResources) {
    handlers.forEach(h => {
      const oldActionId = h.actionId;
      const action = humanizedResources.get(oldActionId);
      if (!action) {
        delete h.actionId;
        return;
      }
      h.actionId = action.id;
    });
  }
}
