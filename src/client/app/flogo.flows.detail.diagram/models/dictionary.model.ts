import { IFlogoFlowDiagramTask, IFlogoFlowDiagramNode } from '../models';

export interface IFlogoFlowDiagramTaskDictionary {
  [ index : string ] : IFlogoFlowDiagramTask
}

export interface IFlogoFlowDiagramNodeDictionary {
  [ index : string ] : IFlogoFlowDiagramNode
}
