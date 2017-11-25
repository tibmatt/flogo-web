import { IFlogoFlowDiagram, IFlogoFlowDiagramTaskDictionary } from '../../core/models';

export interface HandlerInfo {
  diagram: IFlogoFlowDiagram;
  tasks: IFlogoFlowDiagramTaskDictionary;
}
