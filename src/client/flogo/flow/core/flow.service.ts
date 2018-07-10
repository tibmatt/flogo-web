import { get, uniq, fromPairs, isEqual, omit } from 'lodash';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { of as observableOfValue } from 'rxjs';

import { Action, Dictionary, LegacyFlowWrapper, UiFlow } from '@flogo/core';
import { APIFlowsService } from '@flogo/core/services/restapi/v2/flows-api.service';
import { FlowsService } from '@flogo/core/services/flows.service';
import { isSubflowTask } from '@flogo/shared/utils';
import { flogoFlowToJSON } from './models/backend-flow/flow.model';

import { UIModelConverterService } from './ui-model-converter.service';
import { FlogoFlowDetails } from './models';
import { FlowData } from './flow-data';
import { AppState } from './state/app.state';
import { Init } from './state';
import { Trigger, TriggerHandler } from './interfaces';

function normalizeTriggersAndHandlersForAction(actionId: string, originalTriggers: Trigger[]) {
  const triggers: Dictionary<Trigger> = {};
  const handlers: Dictionary<TriggerHandler> = {};
  const findHandlerForAction = (handler: TriggerHandler) => handler.actionId === actionId;
  originalTriggers.forEach(trigger => {
    triggers[trigger.id] = trigger;
    const handler = trigger.handlers.find(findHandlerForAction);
    handlers[trigger.id] = { ...handler, triggerId: trigger.id };
  });
  return { triggers, handlers };
}

@Injectable()
export class FlogoFlowService {
  public currentFlowDetails: FlogoFlowDetails;
  private previousSavedFlow: LegacyFlowWrapper = null;

  constructor(private _flowAPIService: APIFlowsService,
              private _converterService: UIModelConverterService,
              private _commonFlowsService: FlowsService,
              private store: Store<AppState>) {
  }

  loadFlow(flowId: string): Promise<FlowData> {
    this.previousSavedFlow = null;
    return this._flowAPIService.getFlow(flowId)
      .then((flow: Action): PromiseLike<[Action, Action[]]> => {
        const subFlowTasks = get(flow, 'data.flow.rootTask.tasks', [])
          .concat(get(flow, 'data.flow.errorHandlerTask.tasks', []))
          .filter(t => isSubflowTask(t.type));
        const flowIdsToFetch = uniq<string>(subFlowTasks.map(t => (t.settings || {}).flowPath));
        if (flowIdsToFetch.length > 0) {
          return Promise.all([flow, this._flowAPIService.getSubFlows(flow.appId, flowIdsToFetch)]);
        }
        return Promise.resolve([flow, []] as [Action, Action[]]);
      })
      .then(([flow, subflows]) => {
        const flowTriggers = flow.triggers || [];
        const flowDiagramDetails = omit(flow, [
          'triggers'
        ]);
        const { triggers, handlers } = normalizeTriggersAndHandlersForAction(flow.id, flowTriggers);
        const linkedSubflows = fromPairs(subflows.map(a => [a.id, a]) as [string, Action][]);
        this.currentFlowDetails = new FlogoFlowDetails(flow, this.store);

        this._converterService.setProfile(this.currentFlowDetails.applicationProfileType);
        return this._converterService.getWebFlowModel(flowDiagramDetails, linkedSubflows)
          .then(convertedFlow => {
            this.previousSavedFlow = flogoFlowToJSON(convertedFlow);
            this.store.dispatch(new Init({ ...convertedFlow, triggers, handlers, linkedSubflows }));
            return {
              flow: convertedFlow,
              triggers: flowTriggers,
            };
          });
      });
  }

  saveFlow(flowId, uiFlow: UiFlow) {
    const legacyFlow = flogoFlowToJSON(uiFlow);
    return this.saveLegacyFlow(flowId, legacyFlow);
  }

  saveFlowIfChanged(flowId, uiFlow: UiFlow) {
    const legacyFlow = flogoFlowToJSON(uiFlow);
    if (this.didFlowChange(legacyFlow)) {
      this.previousSavedFlow = legacyFlow;
      return this.saveLegacyFlow(flowId, legacyFlow);
    } else {
     return observableOfValue(false);
    }
  }

  deleteFlow(flowId, triggerId) {
    return this._commonFlowsService.deleteFlowWithTrigger(flowId, triggerId);
  }

  listFlowsByName(appId, name) {
    return this._flowAPIService
      .findFlowsByName(name, appId)
      .toPromise();
  }

  listFlowsForApp(appId) {
    return this._flowAPIService.getSubFlows(appId);
  }

  private saveLegacyFlow(flowId: string, { name, description, flow, metadata }: LegacyFlowWrapper) {
    const action = { name, description, data: { flow }, metadata };
    return this._flowAPIService.updateFlow(flowId, action);
  }

  private didFlowChange(nextValue: LegacyFlowWrapper) {
    return !isEqual(this.previousSavedFlow, nextValue);
  }

}
