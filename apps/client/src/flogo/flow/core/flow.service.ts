import { get, uniq, fromPairs, isEqual, omit } from 'lodash';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { of as observableOfValue } from 'rxjs';

import { Action, Dictionary, UiFlow } from '@flogo-web/client-core';
import { APIFlowsService, FlowsService } from '@flogo-web/client-core/services';
import { isSubflowTask } from '@flogo-web/client-shared/utils';

import { UIModelConverterService } from './ui-model-converter.service';
import { savableFlow } from './models/backend-flow/flow.model';
import { FlogoFlowDetails } from './models/flow-details.model';
import { FlowData } from './flow-data';
import { AppState } from './state/app.state';
import { FlowState, Init } from './state';
import { Trigger, TriggerHandler } from './interfaces';

function normalizeTriggersAndHandlersForAction(
  actionId: string,
  originalTriggers: Trigger[]
) {
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
  private previousSavedFlow: Action = null;

  constructor(
    private _flowAPIService: APIFlowsService,
    private _converterService: UIModelConverterService,
    private _commonFlowsService: FlowsService,
    private store: Store<AppState>
  ) {}

  loadFlow(flowId: string): Promise<FlowData> {
    this.previousSavedFlow = null;
    return this._flowAPIService
      .getFlow(flowId)
      .then(
        (flow: Action): PromiseLike<[Action, Action[]]> => {
          const allTasks = ((flow && flow.tasks) || []).concat(
            get(flow, 'errorHandler.tasks', [])
          );
          const subFlowTasks = allTasks.filter(t => isSubflowTask(t.type));
          const flowIdsToFetch = uniq<string>(
            subFlowTasks.map(t => (t.settings || {}).flowPath)
          );
          if (flowIdsToFetch.length > 0) {
            return Promise.all([
              flow,
              this._flowAPIService.getSubFlows(flow.appId, flowIdsToFetch),
            ]);
          }
          return Promise.resolve([flow, []] as [Action, Action[]]);
        }
      )
      .then(([flow, subflows]) => {
        const flowTriggers = flow.triggers || [];
        const flowDiagramDetails = omit(flow, ['triggers']);
        const { triggers, handlers } = normalizeTriggersAndHandlersForAction(
          flow.id,
          flowTriggers
        );
        const linkedSubflows = fromPairs(subflows.map(a => [a.id, a]) as [
          string,
          Action
        ][]);
        this.currentFlowDetails = new FlogoFlowDetails(flow, this.store);

        this._converterService.setProfile();
        return this._converterService
          .getWebFlowModel(flowDiagramDetails, linkedSubflows)
          .then(convertedFlow => {
            this.previousSavedFlow = savableFlow(convertedFlow);
            this.store.dispatch(
              new Init({
                ...convertedFlow,
                triggers,
                handlers,
                linkedSubflows,
              } as FlowState)
            );
            return {
              flow: convertedFlow,
              triggers: flowTriggers,
            };
          });
      });
  }

  saveFlow(flowId, uiFlow: UiFlow) {
    return this._flowAPIService.updateFlow(flowId, savableFlow(uiFlow));
  }

  saveFlowIfChanged(flowId, uiFlow: UiFlow) {
    const flow = savableFlow(uiFlow);
    if (this.didFlowChange(flow)) {
      this.previousSavedFlow = flow;
      return this._flowAPIService.updateFlow(flowId, flow);
    } else {
      return observableOfValue(false);
    }
  }

  deleteFlow(flowId, triggerId) {
    return this._commonFlowsService.deleteFlowWithTrigger(flowId, triggerId);
  }

  listFlowsByName(appId, name) {
    return this._flowAPIService.findFlowsByName(name, appId).toPromise();
  }

  listFlowsForApp(appId) {
    return this._flowAPIService.getSubFlows(appId);
  }

  private didFlowChange(nextValue: Action) {
    return !isEqual(this.previousSavedFlow, nextValue);
  }
}
