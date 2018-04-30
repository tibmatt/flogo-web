import { assign, isEmpty, get, uniq, isEqual, omit } from 'lodash';
import { Injectable } from '@angular/core';
import { of as observableOfValue } from 'rxjs/observable/of';

import { ActionBase, Dictionary, FlowDiagram, Item, LegacyFlowWrapper, UiFlow } from '@flogo/core';
import { APIFlowsService } from '@flogo/core/services/restapi/v2/flows-api.service';
import { FlowsService } from '@flogo/core/services/flows.service';
import { isSubflowTask } from '@flogo/shared/utils';
import { flogoFlowToJSON } from '../shared/diagram/models/flow.model';

import { UIModelConverterService } from './ui-model-converter.service';
import { FlogoFlowDetails } from './models';
import { FlowData } from './flow-data';

@Injectable()
export class FlogoFlowService {
  public currentFlowDetails: FlogoFlowDetails;
  private previousSavedFlow: LegacyFlowWrapper = null;

  constructor(private _flowAPIService: APIFlowsService,
              private _converterService: UIModelConverterService,
              private _commonFlowsService: FlowsService) {
  }

  loadFlow(flowId: string): Promise<FlowData> {
    this.previousSavedFlow = null;
    return this._flowAPIService.getFlow(flowId)
      .then(flow => {
        const subFlowTasks = get(flow, 'data.flow.rootTask.tasks', [])
          .concat(get(flow, 'data.flow.errorHandlerTask.tasks', []))
          .filter(t => isSubflowTask(t.type));
        const flowIdsToFetch = uniq<string>(subFlowTasks.map(t => (t.settings || {}).flowPath));
        if (flowIdsToFetch.length > 0) {
          return Promise.all([flow, this._flowAPIService.getSubFlows(flow.appId, flowIdsToFetch)]);
        }
        return Promise.all([flow, flowIdsToFetch]);
      })
      .then(([flow, subflows]) => {
        const flowDiagramDetails = omit(flow, [
          'triggers'
        ]);

        const triggers = flow.triggers;

        if (this.currentFlowDetails) {
          this.currentFlowDetails.destroy();
        }

        this.currentFlowDetails = new FlogoFlowDetails(flow, subflows);
        this._converterService.setProfile(this.currentFlowDetails.applicationProfileType);
        const subflowsMap = new Map<string, ActionBase>(subflows.map(a => [a.id, a]));
        return this._converterService.getWebFlowModel(flowDiagramDetails, subflowsMap)
          .then(convertedFlow => {
            this.currentFlowDetails.initState(convertedFlow);
            this.previousSavedFlow = flogoFlowToJSON(convertedFlow);
            return this.processFlowModel(convertedFlow, flow.triggers.length > 0);
          })
          .then(processedFlow => {
            return assign({}, processedFlow, { triggers });
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

  processFlowModel(model, hasTrigger?: boolean): Promise<FlowData> {
    let diagram: FlowDiagram;
    let errorDiagram: FlowDiagram;
    let tasks: Dictionary<Item>;
    let errorTasks: Dictionary<Item>;
    let flow: any;
    if (!isEmpty(model)) {
      // initialisation
      flow = model;
      tasks = flow.items;
      if (isEmpty(flow.paths)) {
        diagram = flow.paths = <FlowDiagram>{
          root: {},
          nodes: {}
        };
      } else {
        diagram = flow.paths;
      }

      if (isEmpty(flow.errorHandler)) {
        flow.errorHandler = {
          paths: {},
          items: {}
        };
      }

      errorTasks = flow.errorHandler.items;
      if (isEmpty(flow.errorHandler.paths)) {
        errorDiagram = flow.errorHandler.paths = <FlowDiagram>{
          root: {},
          nodes: {}
        };
      } else {
        errorDiagram = flow.errorHandler.paths;
      }
      if (hasTrigger) {
        diagram.hasTrigger = hasTrigger;
      }
    }
    return Promise.resolve<FlowData>({
      flow,
      root: {
        diagram,
        tasks
      },
      errorHandler: {
        diagram: errorDiagram,
        tasks: errorTasks
      },
      // will be added later
      triggers: [],
    });
  }

  private saveLegacyFlow(flowId: string, { name, description, flow, metadata }: LegacyFlowWrapper) {
    const action = { name, description, data: { flow }, metadata };
    return this._flowAPIService.updateFlow(flowId, action);
  }

  private didFlowChange(nextValue: LegacyFlowWrapper) {
    return !isEqual(this.previousSavedFlow, nextValue);
  }

}
