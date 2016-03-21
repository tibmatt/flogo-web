import { FGNode } from './fg-node';

export interface FGDiagramRootNode {
  is: string; // marking the root node in this dictionary
}

/**
 * dictionary saving the graph of a diagram
 * other than the root, the other items in this dictionary should be FGNode format,
 * and their ids should be the ids of the FGNodes
 */
export interface FGDiagram {
  root: FGDiagramRootNode;
  nodes: {
    [ index: string ]: FGNode;
  };
};
