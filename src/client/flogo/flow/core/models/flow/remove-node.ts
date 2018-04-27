import { fromPairs, partition } from 'lodash';
import { FlowGraph, GraphNode, NodeType } from '@flogo/core';
import { NodeDictionary } from '@flogo/core/interfaces/graph/graph';

export function removeNode(fromFlowGraph: FlowGraph, nodeId: string): FlowGraph {
  const { [nodeId]: nodeToRemove, ...nodes  } = fromFlowGraph.nodes;
  if (!nodeToRemove) {
    return fromFlowGraph;
  }
  let flowGraph = { ...fromFlowGraph, nodes };
  if (nodeToRemove.parents.length <= 0 && nodeToRemove.children.length <= 0) {
    return flowGraph;
  }

  const [parentId] = nodeToRemove.parents;
  let parentNode;
  if (parentId) {
    parentNode = unlinkChild(flowGraph.nodes[parentId], nodeToRemove.id);
    flowGraph.nodes = {
      ...flowGraph.nodes,
      [parentId]: parentNode,
    };
  }

  let branches = [];
  let childTasks = [];
  if (nodeToRemove.type === NodeType.Task) {
    const childNodes = nodeToRemove.children.map(childId => flowGraph.nodes[childId]);
    [childTasks, branches] = partition(childNodes, node => node.type === NodeType.Task);
  } else {
    branches = [nodeToRemove];
  }

  if (parentNode) {
    flowGraph = linkParentWithChildren(flowGraph, parentNode, childTasks);
  } else {
    const [newRootNode] = childTasks;
    flowGraph = updateRootNode(flowGraph, newRootNode);
  }

  flowGraph.nodes = branches.reduce(deleteChildren, flowGraph.nodes);
  return flowGraph;
}

function updateRootNode(flowGraph: FlowGraph, rootNode: GraphNode): FlowGraph {
  return {
    ...flowGraph,
    rootId: rootNode.id,
    nodes: {
      ...flowGraph.nodes,
      [rootNode.id]:  {
        ...rootNode,
        parents: [],
      }
    },
  };
}

function unlinkChild(node: GraphNode, childToRemoveId: string): GraphNode {
  return {
    ...node,
    children: node.children.filter(childId => childId !== childToRemoveId)
  };
}

function deleteChildren(nodes: NodeDictionary, node: GraphNode): NodeDictionary {
  nodes = { ...nodes };
  node.children.forEach(childId => {
    const childNode = nodes[childId];
    delete nodes[childId];
    nodes = deleteChildren(nodes, childNode);
  });
  return nodes;
}

function linkParentWithChildren(flowGraph: FlowGraph, parent: GraphNode, childNodes: GraphNode[]): FlowGraph {
  const updatedNodes = fromPairs(
    childNodes.map(child => [child.id, { ...child, parents: [parent.id] }])
  );
  const nodes = {
    ...flowGraph.nodes,
    ...updatedNodes,
    [parent.id]: {
      ...parent,
      children: [...parent.children, ...childNodes.map(child => child.id)]
    },
  };
  return { ...flowGraph, nodes };
}

