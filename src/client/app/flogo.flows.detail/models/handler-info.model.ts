import {
  IFlogoFlowDiagramTaskDictionary,
  IFlogoFlowDiagram
} from '../../../common/models';

export interface HandlerInfo {
  diagram: IFlogoFlowDiagram,
  tasks: IFlogoFlowDiagramTaskDictionary
}
