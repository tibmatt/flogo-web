import { FlowState } from '../flow.state';
import { RemoveItem } from '../flow.actions';
import { getGraphName, getItemsDictionaryName, PayloadOf } from '../utils';
import { removeNode } from '../../models/flow/remove-node';
import { CurrentSelection, SelectionType } from '../../models/selection';

export function removeItem(state: FlowState, payload: PayloadOf<RemoveItem>) {
  const {handlerType, itemId} = payload;
  const graphName = getGraphName(handlerType);
  const itemDictionaryName = getItemsDictionaryName(handlerType);
  const result = removeNode({flowGraph: state[graphName], items: state[itemDictionaryName]}, itemId);
  if (result.flowGraph === state[graphName]) {
    return state;
  }
  let currentSelection = state.currentSelection;
  if (shouldClearCurrentSelection(currentSelection, itemId)) {
    currentSelection = null;
  }
  return {
    ...state,
    [graphName]: result.flowGraph,
    [itemDictionaryName]: result.items,
    currentSelection
  };
}

function shouldClearCurrentSelection(selection: CurrentSelection, taskIdToRemove: string): boolean {
  if (!selection) {
    return false;
  }
  let taskId;
  if (selection.type === SelectionType.Task) {
    taskId = selection.taskId;
  } else if (selection.type === SelectionType.InsertTask) {
    taskId = selection.parentId;
  }
  if (!taskId) {
    return false;
  }
  return taskIdToRemove === taskId;
}
