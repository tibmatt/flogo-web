import { isEmpty, times, partialRight } from 'lodash';
import { Node, NodeDictionary, NodeType } from '../interfaces/index';
import { NodeMatrix } from './matrix';

interface TranslateContext {
  parentNode: Node;
  nodes: NodeDictionary;
}

export function nodesToNodeMatrix(rootNode: Node, nodes: NodeDictionary): NodeMatrix {
  const matrix: NodeMatrix = [[rootNode]];
  translateChildren({ parentNode: rootNode, nodes }, matrix);
  return matrix;
}

const arrayOfNulls = partialRight<number, Function, null[]>(times, () => null);

export function translateChildren(context: TranslateContext, matrix: NodeMatrix): NodeMatrix {
  const children = retrieveChildrenNodes(context).sort(nonBranchesFirst);
  if (isEmpty(children)) {
    return matrix;
  }
  const currentRow = matrix[matrix.length - 1];
  children.forEach((node: Node, index) => {
    if (node.type === NodeType.Branch) {
      const newRow: Node[] = arrayOfNulls(index);
      newRow.push(node);
      matrix.push(newRow);
    } else {
      currentRow.push(node);
    }
    translateChildren({ ...context, parentNode: node }, matrix);
  });
  return matrix;
}

function retrieveChildrenNodes({ parentNode, nodes }: TranslateContext) {
  if (!parentNode || !parentNode.children) {
    return [];
  }
  return parentNode.children.map(nodeId => nodes[nodeId]);
}

function nonBranchesFirst(nodeA: Node, nodeB: Node): number {
  if (nodeA.type === nodeB.type) {
    return 0;
  }
  return nodeA.type === NodeType.Branch ? 1 : -1;
}
