import { isEmpty } from 'lodash';
import { ActivitySchema, GraphNode } from '@flogo/core';
import { isIterableTask } from '@flogo/shared/utils';
import { FlowState } from '../flow.state';
import { ItemUpdated } from '../flow.actions';
import { itemIsTask } from '../../models/utils';
import { getGraphName, getItemsDictionaryName, PayloadOf } from '../utils';
import { validateOne } from '../../models/flow/validate-item';

export function itemUpdate(state: FlowState, payload: PayloadOf<ItemUpdated>) {
  const { handlerType, item } = payload;
  let { node } = payload;
  const itemsDictionaryName = getItemsDictionaryName(handlerType);
  const items = state[itemsDictionaryName];
  const newItemState = {...items[item.id], ...item};

  const graphName = getGraphName(handlerType);
  const graph = state[graphName];
  node = node || {};
  const currentNode = graph.nodes[newItemState.id];
  const validationErrors = itemIsTask(newItemState) ? validateOne(<ActivitySchema>state.schemas[newItemState.ref], newItemState) : null;
  const hasErrors = !isEmpty(validationErrors);
  const newNodeState: GraphNode = {
    ...currentNode,
    ...node,
    status: {
      ...currentNode.status,
      ...(node.status || {}),
      iterable: isIterableTask(newItemState),
      invalid: hasErrors,
      errors: hasErrors ? validationErrors : null,
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
