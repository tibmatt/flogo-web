import { Dictionary } from '../common/dictionary';
import { RootNode } from './root-node';
import { Node } from './node';

export type NodeDictionary = Dictionary<Node>;

export interface FlowDiagram {
  root?: RootNode;
  hasTrigger?: boolean;
  nodes: NodeDictionary;
  MAX_ROW_LEN?: number;
}
