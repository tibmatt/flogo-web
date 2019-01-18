import { isEqual } from 'lodash';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { of as observableOfValue, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Action, UiFlow, ResourceService } from '@flogo-web/client-core';
import { APIFlowsService, FlowsService } from '@flogo-web/client-core/services';

import { savableFlow } from './models/backend-flow/flow.model';
import { MicroServiceModelConverter } from './models/profiles/microservice-converter.model';
import { FlogoFlowDetails } from './models/flow-details.model';
import { loadFlow } from './models/load-flow';
import { FlowData } from './flow-data';
import { AppState } from './state/app.state';
import { FlowState, Init } from './state';
import { FlowResource } from './interfaces';

@Injectable()
export class FlogoFlowService {
  public currentFlowDetails: FlogoFlowDetails;
  private previousSavedFlow: Action = null;

  constructor(
    private _flowAPIService: APIFlowsService,
    private converterService: MicroServiceModelConverter,
    private _commonFlowsService: FlowsService,
    private resourceService: ResourceService,
    private store: Store<AppState>
  ) {}

  loadFlow(resource: FlowResource): Observable<FlowData> {
    this.previousSavedFlow = null;

    const fetchSubflows = subflowIds =>
      this._flowAPIService.getSubFlows(resource.id, subflowIds);
    const convertServerToUIModel = (fromResource, linkedSubflows) =>
      this.converterService.convertToWebFlowModel(fromResource, linkedSubflows);

    return loadFlow(fetchSubflows, convertServerToUIModel, resource).pipe(
      tap(({ convertedFlow, triggers, handlers, linkedSubflows }) => {
        this.currentFlowDetails = new FlogoFlowDetails(resource.id, this.store);
        this.previousSavedFlow = savableFlow(convertedFlow);
        this.store.dispatch(
          new Init({
            ...convertedFlow,
            triggers,
            handlers,
            linkedSubflows,
          } as FlowState)
        );
      }),
      map(({ convertedFlow, flowTriggers }) => ({
        flow: convertedFlow,
        triggers: flowTriggers,
      }))
    );
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
