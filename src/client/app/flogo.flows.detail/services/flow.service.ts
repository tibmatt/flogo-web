import {Injectable} from '@angular/core';
import {UIModelConverterService} from "./ui-model-converter.service";
import { IFlogoFlowDiagram } from "../../flogo.flows.detail.diagram/models/diagram.model";
import { flogoFlowToJSON } from "../../flogo.flows.detail.diagram/models/flow.model";
import {IFlogoFlowDiagramTaskDictionary} from "../../flogo.flows.detail.diagram/models/dictionary.model";
import {APIFlowsService} from "../../../common/services/restapi/v2/flows-api.service";
import {  } from "../../../common/utils";

interface FlowData {
  flow: any,
  root: {
    diagram: any;
    tasks: any;
  };
  errorHandler: {
    diagram: any,
    tasks: any
  };
};

@Injectable()
export class FlogoFlowService {
  constructor(private _flowAPIService: APIFlowsService, private _converterService: UIModelConverterService) {
  }

  getFlow(flowId: string): Promise<FlowData> {
    return this._flowAPIService.getFlow(flowId)
      .then((flow) => {
        let flowDiagramDetails = _.omit(flow, [
          'trigger',
          'handler'
        ]);

        if (flow.trigger) {
          let triggerDetails = Object.assign({}, flow.trigger);
          return this._converterService.getWebFlowModel(flowDiagramDetails, triggerDetails)
            .then(convertedFlow =>  this.processFlowModel(convertedFlow));
        } else {
          // TODO: should create empty diagram instead
          return {
            flow,
            root: { diagram: null, tasks: null },
            errorHandler: { diagram: null, tasks: null }
          };
        }
      });
  }

  saveFlow(flowId, uiFlow) {
    const { name, description, flow } = flogoFlowToJSON(uiFlow);
    const action = { name, description, data: { flow } };
    return this._flowAPIService.updateFlow(flowId, action);
  }

  deleteFlow(flowId) {
    return this._flowAPIService.deleteFlow(flowId);
  }

  processFlowModel(model): Promise<FlowData> {
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
        }
      } else {
        errorDiagram = flow.errorHandler.paths;
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
