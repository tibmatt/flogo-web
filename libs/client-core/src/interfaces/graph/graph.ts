import { Dictionary } from '../common';
import { GraphNode } from './node';

export type NodeDictionary = Dictionary<GraphNode>;

export interface FlowGraph {
  rootId: string;
  nodes: NodeDictionary;
}
