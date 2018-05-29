import { FlowState } from '../flow.state';
import { getGraphName, getItemsDictionaryName, PayloadOf } from '../utils';
import { TaskItemCreated } from '../flow.actions';
import { addNewNode } from '../../models/flow/add-new-node';
import { makeTaskSelection } from '../../models/flow/selection';

export function taskItemCreated(state: FlowState, payload: PayloadOf<TaskItemCreated>) {
  const {handlerType, schema, item, node} = payload;
  const graphName = getGraphName(handlerType);
  const itemsDictionaryName = getItemsDictionaryName(handlerType);
  const itemsDictionary = state[itemsDictionaryName];
  const schemas = schema ? {...state.schemas, [schema.ref]: schema} : state.schemas;

  return {
    ...state,
    currentSelection: makeTaskSelection(handlerType, node.id),
    [graphName]: addNewNode(state[graphName], node),
    [itemsDictionaryName]: {
      ...itemsDictionary,
      [item.id]: {...item}
    },
    schemas,
  };
}
