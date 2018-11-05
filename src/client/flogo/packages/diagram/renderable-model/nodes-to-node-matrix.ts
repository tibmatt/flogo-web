import {isEmpty, partialRight, times} from 'lodash';
import {GraphNode, GraphNodeDictionary, NodeType} from '@flogo/core';
import { NodeMatrix, isNodeWithBranch, NodeWithBranch } from './matrix';

interface TranslateContext {
  parentNode: GraphNode;
  parentIndexInRow: number;
  nodes: GraphNodeDictionary;
}

export function nodesToNodeMatrix(rootNode: GraphNode, nodes: GraphNodeDictionary): NodeMatrix {
  const matrix: NodeMatrix = [[rootNode]];
  translateChildren({ parentNode: rootNode,  parentIndexInRow: 0, nodes }, matrix);
  return matrix;
}

const arrayOfNulls = partialRight<number, Function, null[]>(times, () => null);

export function translateChildren(context: TranslateContext, matrix: NodeMatrix): NodeMatrix {
  const children = retrieveChildrenNodes(context).sort(nonBranchesFirst);
  if (isEmpty(children)) {
    return matrix;
  }
  const currentRowIndex = matrix.length - 1;
  const currentRow = matrix[currentRowIndex];
  children.forEach((node: GraphNode) => {
    if (node.type === NodeType.Branch && !node.features.isMainBranch) {
      const padding = context.parentIndexInRow;
      const newRow: GraphNode[] = arrayOfNulls(padding);
      newRow.push(node);
      matrix.push(newRow);
    } else if (node.type === NodeType.Branch && node.features.isMainBranch) {
      currentRow[currentRow.length - 1] = { node: context.parentNode, branch: node };
    } else {
      currentRow.push(node);
    }
    translateChildren({ ...context, parentNode: node, parentIndexInRow: currentRow.length - 1 }, matrix);
  });
  return matrix;
}

function retrieveChildrenNodes({ parentNode, nodes }: TranslateContext) {
  if (!parentNode || !parentNode.children) {
    return [];
  }
  return parentNode.children.map(nodeId => nodes[nodeId]);
}

function nonBranchesFirst(nodeA: GraphNode, nodeB: GraphNode): number {
  if (nodeA.type === nodeB.type) {
    return 0;
  }
  return nodeA.type === NodeType.Branch && !nodeA.features.isMainBranch ? 1 : -1;
}
