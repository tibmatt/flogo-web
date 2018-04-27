import { FlowGraph, GraphNode } from '@flogo/core';

export function insertNode(flowGraph: FlowGraph, node: GraphNode, parentId?: string): FlowGraph {
  let parent = flowGraph.nodes[parentId];
  if (!parent && !flowGraph.rootId) {
    flowGraph.rootId = node.id;
  }
  parent = { ...parent, children: [...parent.children, node.id] };
  return {
    ...flowGraph,
    nodes: {
      ...flowGraph.nodes,
      [parent.id]: parent,
      [node.id]: { ...node },
    }
  };
}
