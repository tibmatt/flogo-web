import { Dictionary } from '@flogo/core';
import { Node } from './node';

export type NodeDictionary = Dictionary<Node>;

export interface Flow {
  rootId: string;
  nodes: NodeDictionary;
}
