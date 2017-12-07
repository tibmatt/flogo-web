import { IFlogoFlowDiagramTask } from './task.model';
import { IFlogoFlowDiagramNode } from './node.model';

export interface IFlogoFlowDiagramTaskDictionary {
  [ index: string ]: IFlogoFlowDiagramTask;
}

export interface IFlogoFlowDiagramNodeDictionary {
  [ index: string ]: IFlogoFlowDiagramNode;
}
