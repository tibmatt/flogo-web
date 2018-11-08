import { actionHasSubflowTasks, forEachSubflowTaskInAction } from '../../../common/utils/subflow';
import { actionNormalizer } from './action-normalizer';
import {taskAttributesToMappingsUnifier} from "./task-attributes-to-mappings-unifier";

export class AbstractActionsImporter {

  constructor(actionStorage, activitySchemas) {
    this.actionStorage = actionStorage;
    this.activitySchemas = activitySchemas;
  }

  // eslint-disable-next-line no-unused-vars
  extractActions(fromRawApp) {
    throw new Error('You have to implement the method extractActions!');
  }

  async importAll(appId, fromRawApp) {
    const rawActions = this.extractActions(fromRawApp).map(actionNormalizer)
      .map(action => taskAttributesToMappingsUnifier(action, this.activitySchemas));

    const actionPairs = await this.storeActions(appId, rawActions);
    let actionRegistry = new Map(actionPairs);
    actionRegistry = await this.reconcileSubflows(actionRegistry);
    return actionRegistry;
  }

  // TODO: a better approach to avoid having to call the actionStorage twice per flow could be to figure out the
  // flow -> subflow relationship chain and store them in reverse order so we can fix the subflow refs as we go storing
  // the actions but it will require to deal with cyclic references e.g. flow1 -> subflow1 -> flow1
  async reconcileSubflows(actionRegistry) {
    const reconcileOperations = [...actionRegistry.entries()]
      .filter(([, action]) => actionHasSubflowTasks(action))
      .map(async ([originalActionId, action]) => {
        action = this.reconcileSubflowTasksInAction(action, actionRegistry);
        const updatedAction = await this.updateAction(action);
        actionRegistry.set(originalActionId, updatedAction);
      });
    await Promise.all(reconcileOperations);
    return actionRegistry;
  }

  reconcileSubflowTasksInAction(action, actionsByOriginalId) {
    forEachSubflowTaskInAction(action, task => {
      const originalFlowPath = task.settings.flowPath;
      task.settings.flowPath = actionsByOriginalId.get(originalFlowPath).id;
    });
    return action;
  }

  async storeActions(appId, rawActions = []) {
    const actionPromises = rawActions.map(async rawAction => {
      const originalActionId = rawAction.id;
      const action = await this.storeSingleAction(appId, rawAction);
      return [originalActionId, action];
    });
    return Promise.all(actionPromises);
  }

  /**
   *
   * @param appId
   * @param rawAction
   * @return {Promise}
   */
  async storeSingleAction(appId, rawAction) {
    return this.actionStorage.create(appId, rawAction);
  }

  async updateAction(action) {
    return this.actionStorage.update(action.id, action);
  }

}
