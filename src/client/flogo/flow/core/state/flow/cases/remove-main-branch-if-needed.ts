import { NodeType, Dictionary, GraphNode } from '@flogo/core';
import { FlowState } from '../flow.state';
import { HandlerType } from '../../../models';
import { getItemsDictionaryName, getGraphName } from '../../utils';

const isMainBranch = node => node.type === NodeType.Branch && node.features.isMainBranch;

export function removeMainBranchIfNeeded(prevState: FlowState, handlerType: HandlerType, itemToRemoveId: string): FlowState {
  const graphName = getGraphName(handlerType);
  let nodeDictionary = prevState[graphName].nodes as Dictionary<GraphNode>;
  const nodeToRemove = nodeDictionary[itemToRemoveId];
  if (nodeToRemove.type !== NodeType.Branch) {
    return prevState;
  }

  const mainBranchId = findMainBranchId(nodeDictionary, nodeToRemove, itemToRemoveId);
  if (!mainBranchId) {
    return prevState;
  }

  const nextState = removeItem(prevState, handlerType, mainBranchId);
  nodeDictionary = unlinkAndRemoveBranch(nodeDictionary, mainBranchId);

  return {
    ...nextState,
    [graphName]: {
      ...nextState[graphName],
      nodes: nodeDictionary,
    },
  };
}

function findMainBranchId(nodeDictionary: Dictionary<GraphNode>, nodeToRemove: GraphNode, itemToRemoveId: string) {
  const [parentItemId] = nodeToRemove.parents;
  const parentItem = nodeDictionary[parentItemId];
  const mainBranchId = parentItem.children.find(childId => childId !== itemToRemoveId && isMainBranch(nodeDictionary[childId]));
  return mainBranchId;
}

function unlinkAndRemoveBranch(nodeDictionary: Dictionary<GraphNode>, mainBranchId: string) {
  nodeDictionary = {...nodeDictionary};

  const mainBranchNode = nodeDictionary[mainBranchId];
  delete nodeDictionary[mainBranchId];

  const branchSource = nodeDictionary[mainBranchNode.parents[0]];
  const sourceChildren = branchSource.children.filter(id => id === mainBranchId);

  const branchTarget = mainBranchNode.children.length > 0 ? nodeDictionary[mainBranchNode.children[0]] : null;
  if (branchTarget) {
    nodeDictionary[branchTarget.id] = {
      ...branchTarget,
      parents: [branchSource.id],
    };
    sourceChildren.push(branchTarget.id);
  }
  nodeDictionary[branchSource.id] = {
    ...branchTarget,
    children: branchSource.children.filter(id => id === mainBranchId),
  };
  return nodeDictionary;
}

function removeItem(prevState: FlowState, handlerType: HandlerType, itemId: string) {
  const itemsDictionaryName = getItemsDictionaryName(handlerType);
  const { [itemId]: removedItem, ...itemsDictionary } = prevState[itemsDictionaryName];
  return {
    ...prevState,
    [itemsDictionaryName]: itemsDictionary,
  };
}

