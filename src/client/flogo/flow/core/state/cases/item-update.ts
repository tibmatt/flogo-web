import { GraphNode } from '@flogo/core';
import { isIterableTask } from '@flogo/shared/utils';
import { FlowState } from '../flow.state';
import { ItemUpdated } from '../flow.actions';
import { getGraphName, getItemsDictionaryName, PayloadOf } from '../utils';

export function itemUpdate(state: FlowState, payload: PayloadOf<ItemUpdated>) {
  const {handlerType, item} = payload;
  let { node } = payload;
  const itemsDictionaryName = getItemsDictionaryName(handlerType);
  const items = state[itemsDictionaryName];
  const newItemState = {...items[item.id], ...item};

  const graphName = getGraphName(handlerType);
  const graph = state[graphName];
  node = node || {};
  const currentNode = graph.nodes[newItemState.id];
  const newNodeState: GraphNode = {
    ...currentNode,
    ...node,
    status: {
      ...currentNode.status,
      ...(node.status || {}),
      iterable: isIterableTask(newItemState),
    },
  };
  return {
    ...state,
    [itemsDictionaryName]: {
      ...items,
      [item.id]: newItemState,
    },
    [graphName]: {
      ...graph,
      nodes: {
        ...graph.nodes,
        [item.id]: newNodeState
      }
    }
  };
}
