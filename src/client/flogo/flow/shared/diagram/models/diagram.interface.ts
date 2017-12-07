import { IFlogoFlowDiagramRootNode } from './node.model';
import { IFlogoFlowDiagramNodeDictionary } from './dictionary.model';

export interface IFlogoFlowDiagram {
  root?: IFlogoFlowDiagramRootNode;
  hasTrigger?: boolean;
  nodes: IFlogoFlowDiagramNodeDictionary;
  MAX_ROW_LEN?: number;
}
