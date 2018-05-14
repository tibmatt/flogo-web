import { FlowState } from '../flow.state';
import { RemoveItem } from '../flow.actions';
import { getGraphName, getItemsDictionaryName, PayloadOf } from '../utils';
import { removeNode } from '../../models/flow/remove-node';

export function removeItem(state: FlowState, payload: PayloadOf<RemoveItem>) {
  const {handlerType, itemId} = payload;
  const graphName = getGraphName(handlerType);
  const itemDictionaryName = getItemsDictionaryName(handlerType);
  const result = removeNode({flowGraph: state[graphName], items: state[itemDictionaryName]}, itemId);
  if (result.flowGraph === state[graphName]) {
    return state;
  }
  let currentSelection = state.currentSelection;
  if (currentSelection && !state.mainGraph[currentSelection.taskId] && !state.errorGraph[currentSelection.taskId]) {
    currentSelection = null;
  }
  return {
    ...state,
    [graphName]: result.flowGraph,
    [itemDictionaryName]: result.items,
    currentSelection
  };
}
