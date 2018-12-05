import { FlowGraph, GraphNode } from '@flogo-web/client/core';

export function insertNode(
  flowGraph: FlowGraph,
  node: GraphNode,
  parentId?: string
): FlowGraph {
  const parent = flowGraph.nodes[parentId];
  let nodes = flowGraph.nodes;
  if (parent) {
    nodes = {
      ...nodes,
      [parent.id]: { ...parent, children: [...parent.children, node.id] },
    };
  } else {
    flowGraph = {
      ...flowGraph,
      rootId: node.id,
    };
  }
  return {
    ...flowGraph,
    nodes: {
      ...nodes,
      [node.id]: node,
    },
  };
}
