import { Injectable } from '@angular/core';
import { UIModelConverterService } from './ui-model-converter.service';
import { FlowDiagram, TaskDictionary } from '@flogo/core';
import { flogoFlowToJSON } from '../shared/diagram/models/flow.model';

import { APIFlowsService } from '../../core/services/restapi/v2/flows-api.service';
import { FlowsService } from '../../core/services/flows.service';
import {FlogoFlowDetails} from '@flogo/flow/core/models/flow-details.model';

export interface FlowData {
  flow: any;
  triggers: any;
  root: {
    diagram: any;
    tasks: any;
  };
  errorHandler: {
    diagram: any,
    tasks: any
  };
}

@Injectable()
export class FlogoFlowService {
  public currentFlowDetails: FlogoFlowDetails;

  constructor(private _flowAPIService: APIFlowsService,
              private _converterService: UIModelConverterService,
              private _commonFlowsService: FlowsService) {
  }

  loadFlow(flowId: string): Promise<FlowData> {
    return this._flowAPIService.getFlow(flowId)
      .then((flow) => {
        const flowDiagramDetails = _.omit(flow, [
          'triggers'
        ]);

        this.currentFlowDetails = new FlogoFlowDetails(flow);

        const triggers = flow.triggers;
        this._converterService.setProfile(this.currentFlowDetails.applicationProfileType);
        return this._converterService.getWebFlowModel(flowDiagramDetails)
          .then(convertedFlow => this.processFlowModel(convertedFlow, flow.triggers.length > 0))
          .then(processedFlow => _.assign({}, processedFlow, { triggers }));
      });
  }

  saveFlow(flowId, uiFlow) {
    const { name, description, flow, metadata } = flogoFlowToJSON(uiFlow);
    const action = { name, description, data: { flow }, metadata };
    return this._flowAPIService.updateFlow(flowId, action);
  }

  deleteFlow(flowId, triggerId) {
    return this._commonFlowsService.deleteFlowWithTrigger(flowId, triggerId);
  }

  listFlowsByName(appId, name) {
    return this._flowAPIService.findFlowsByName(name, appId);
  }

  listFlowsForApp(appId) {
    return this._flowAPIService.findFlowsByName('', appId);
  }

  processFlowModel(model, hasTrigger?: boolean): Promise<FlowData> {
    let diagram: FlowDiagram;
    let errorDiagram: FlowDiagram;
    let tasks: TaskDictionary;
    let errorTasks: TaskDictionary;
    let flow: any;
    if (!_.isEmpty(model)) {
      // initialisation
      console.group('Initialise canvas component');
      flow = model;
      tasks = flow.items;
      if (_.isEmpty(flow.paths)) {
        diagram = flow.paths = <FlowDiagram>{
          root: {},
          nodes: {}
        };
      } else {
        diagram = flow.paths;
      }

      if (_.isEmpty(flow.errorHandler)) {
        flow.errorHandler = {
          paths: {},
          items: {}
        };
      }

      errorTasks = flow.errorHandler.items;
      if (_.isEmpty(flow.errorHandler.paths)) {
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
    return Promise.resolve({
      flow,
      root: {
        diagram,
        tasks
      },
      errorHandler: {
        diagram: errorDiagram,
        tasks: errorTasks
      }
    });
  }
}
