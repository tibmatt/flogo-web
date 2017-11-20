import { IFlogoFlowDiagram, IFlogoFlowDiagramTaskDictionary } from '../../../common/models';

export interface HandlerInfo {
  diagram: IFlogoFlowDiagram;
  tasks: IFlogoFlowDiagramTaskDictionary;
}
