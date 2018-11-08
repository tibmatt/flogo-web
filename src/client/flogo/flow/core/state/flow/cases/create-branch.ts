import { Dictionary, FlowGraph, GraphNode, NodeType, Item } from '@flogo/core';
import { FlowState } from '../flow.state';
import { getGraphName, getItemsDictionaryName, PayloadOf } from '../../utils';
import { CreateBranch } from '../flow.actions';
import { ItemFactory } from '../../../models/graph-and-items/item-factory';
import { addNewBranch } from '../../../models/flow/add-new-branch';
import { makeInsertSelection } from '../../../models/flow/selection';

const hasBranches = (node: GraphNode, graph: Dictionary<GraphNode>) =>
  node.children.some(childId => graph[childId] && graph[childId].type === NodeType.Branch);

export function createBranch(state: FlowState, payload: PayloadOf<CreateBranch>) {
  const graphName = getGraphName(payload.handlerType);
  const itemsDictionaryName = getItemsDictionaryName(payload.handlerType);

  const graph: FlowGraph = state[graphName];
  const parent = graph.nodes[payload.parentId];
  const branchIds = [...payload.nextBranchIds];
  if (!hasBranches(parent, graph.nodes)) {
    const mainBranchId = branchIds.shift();
    state = addMainBranch(state, { newBranchId: mainBranchId, parent, graphName, itemsDictionaryName });
  }

  const [branchId] = branchIds;
  const itemBranch = ItemFactory.makeBranch({ taskID: branchId, condition: 'true' });

  return {
    ...state,
    currentSelection: makeInsertSelection(payload.handlerType, itemBranch.id),
    [itemsDictionaryName]: {
      ...state[itemsDictionaryName],
      [itemBranch.id]: itemBranch,
    },
    [graphName]: addNewBranch(state[graphName], payload.parentId, itemBranch.id),
  };
}

function addMainBranch(
  state: FlowState,
  { newBranchId, parent, graphName, itemsDictionaryName }
    : { newBranchId: string; parent: GraphNode; graphName: string, itemsDictionaryName: string }
): FlowState {
  let graph = state[graphName];
  let nodes: Dictionary<GraphNode> = { ...graph.nodes };
  const childId = parent.children[0];
  if (childId) {
    nodes = linkChildToBranch(nodes, childId, newBranchId);
  }
  nodes[parent.id] = { ...parent, children: [] };
  const children = childId ? [childId] : undefined;
  graph = addNewBranch({...graph, nodes}, parent.id, newBranchId, { isMainBranch: true, children });
  const mainBranch = ItemFactory.makeBranch({ taskID: newBranchId, condition: 'true', isMainBranch: true });
  return {
    ...state,
    [itemsDictionaryName]: {
      ...state[itemsDictionaryName],
      [newBranchId]: mainBranch,
    },
    [graphName]: graph,
  };
}

function linkChildToBranch(nodes: Dictionary<GraphNode>, nodeId: string, branchId: string): Dictionary<GraphNode> {
  return { ...nodes, [nodeId]: { ...nodes[nodeId], parents: [branchId] } };
}
