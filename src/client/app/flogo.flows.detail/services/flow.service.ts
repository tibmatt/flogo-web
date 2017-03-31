import {Injectable} from "@angular/core";
import {UIModelConverterService} from "./ui-model-converter.service";
import {IFlogoFlowDiagram} from "../../flogo.flows.detail.diagram/models/diagram.model";
import {IFlogoFlowDiagramTaskDictionary} from "../../flogo.flows.detail.diagram/models/dictionary.model";
import {APIFlowsService} from "../../../common/services/restapi/v2/flows-api.service";

@Injectable()
export class FlogoFlowService {
  constructor(private _flowAPIService: APIFlowsService, private _converterService: UIModelConverterService) {
  }

  getFlow(flowId: string) {
    return this._flowAPIService.getFlow(flowId)
      .then((flow) => {
        let flowDiagramDetails = _.omit(flow, [
          'trigger',
          'handlers'
        ]);
        let triggerDetails = Object.assign({}, _.get(flow, 'trigger'));
        return this._converterService.getWebFlowModel(flowDiagramDetails, triggerDetails);
      })
      .then((convertedFlow) => {
        return this.processFlowModel(convertedFlow);
      })
      .catch((error)=>{
        console.error(error);
        return null;
      });
  }

  processFlowModel(model) {
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
