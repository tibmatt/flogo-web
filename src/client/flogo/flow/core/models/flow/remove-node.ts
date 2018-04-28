import { fromPairs, partition } from 'lodash';
import { Dictionary, FlowGraph, GraphNode, Item, NodeType } from '@flogo/core';

interface Collections {
  flowGraph: FlowGraph;
  items: Dictionary<Item>;
}

export function removeNode({ flowGraph, items }: Collections, nodeId: string): Collections {
  const { [nodeId]: nodeToRemove, ...resultNodes  } = flowGraph.nodes;
  const { [nodeId]: itemToRemove, ...resultItems  } = items;
  if (!nodeToRemove) {
    return { flowGraph, items };
  }
  flowGraph = { ...flowGraph, nodes: resultNodes };
  items = resultItems;
  if (nodeToRemove.parents.length <= 0 && nodeToRemove.children.length <= 0) {
    return { flowGraph, items };
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

  return branches.reduce(deleteChildren, { flowGraph, items });
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

function deleteChildren(collections: Collections, node: GraphNode): Collections {
  const nodes = collections.flowGraph.nodes;
  node.children.forEach(childId => {
    const childNode = nodes[childId];
    delete nodes[childId];
    delete collections.items[childId];
    collections = deleteChildren(collections, childNode);
  });
  return collections;
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

