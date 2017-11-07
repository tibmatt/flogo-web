import { IFlogoFlowDiagramNode, IFlogoFlowDiagramTask } from '../models';

export interface IFlogoFlowDiagramTaskDictionary {
  [ index: string ]: IFlogoFlowDiagramTask;
}

export interface IFlogoFlowDiagramNodeDictionary {
  [ index: string ]: IFlogoFlowDiagramNode;
}
