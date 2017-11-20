import { Injectable } from '@angular/core';
import { UIModelConverterService } from './ui-model-converter.service';
import { IFlogoFlowDiagram } from '../../flogo.flows.detail.diagram/models/diagram.model';
import { flogoFlowToJSON } from '../../flogo.flows.detail.diagram/models/flow.model';
import { IFlogoFlowDiagramTaskDictionary } from '../../flogo.flows.detail.diagram/models/dictionary.model';
import { APIFlowsService } from '../../../common/services/restapi/v2/flows-api.service';
import { FlowsService } from '../../../common/services/flows.service';

interface FlowData {
  flow: any;
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
  constructor(private _flowAPIService: APIFlowsService,
              private _converterService: UIModelConverterService,
              private _commonFlowsService: FlowsService) {
  }

  getFlow(flowId: string): Promise<FlowData> {
    return this._flowAPIService.getFlow(flowId)
      .then((flow) => {
        const flowDiagramDetails = _.omit(flow, [
          'triggers'
        ]);

        const triggers = flow.triggers;

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

  processFlowModel(model, hasTrigger?: boolean): Promise<FlowData> {
    let diagram: IFlogoFlowDiagram;
    let errorDiagram: IFlogoFlowDiagram;
    let tasks: IFlogoFlowDiagramTaskDictionary;
    let errorTasks: IFlogoFlowDiagramTaskDictionary;
    let flow: any;
    if (!_.isEmpty(model)) {
      // initialisation
      console.group('Initialise canvas component');
      flow = model;
      tasks = flow.items;
      if (_.isEmpty(flow.paths)) {
        diagram = flow.paths = <IFlogoFlowDiagram>{
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
        errorDiagram = flow.errorHandler.paths = <IFlogoFlowDiagram>{
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
