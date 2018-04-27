import { GraphNode, NodeType } from '@flogo/core';
import { DiagramSelectionType } from '@flogo/packages/diagram/interfaces';
import { FlowState } from '../flow-state';
import { insertNode } from './insert-node';
import { newBranchId } from './id-generator';

export function addNewBranch(flowState: FlowState, parentId: string): FlowState {
  const flowGraph = flowState.mainGraph;
  const parentNode = flowGraph.nodes[parentId];
  if (!parentNode || parentNode.type === NodeType.Branch) {
    return;
  }
  const branchNode: GraphNode = {
    id: newBranchId(),
    type: NodeType.Branch,
    parents: [parentNode.id],
    children: [],
    features: {
      canBranch: false,
      canHaveChildren: true,
      deletable: true,
    },
    status: {},
  };
  return {
    ...flowState,
    currentSelection: {
      type: DiagramSelectionType.Insert,
      taskId: branchNode.id,
    },
    mainGraph: insertNode(flowGraph, branchNode, parentId),
  };
}
