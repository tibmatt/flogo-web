import { isEmpty } from 'lodash';
import { ActivitySchema } from '@flogo/core';
import { FlowState } from '../flow.state';
import { getGraphName, getItemsDictionaryName, PayloadOf } from '../utils';
import { TaskItemCreated } from '../flow.actions';
import { addNewNode } from '../../models/flow/add-new-node';
import { makeTaskSelection } from '../../models/flow/selection-factory';
import { validateOne } from '../../models/flow/validate-item';

export function taskItemCreated(state: FlowState, payload: PayloadOf<TaskItemCreated>) {
  const {handlerType, schema, item, node} = payload;
  const graphName = getGraphName(handlerType);
  const itemsDictionaryName = getItemsDictionaryName(handlerType);
  const itemsDictionary = state[itemsDictionaryName];
  const schemas = schema ? {...state.schemas, [schema.ref]: schema} : state.schemas;

  const errors = validateOne(<ActivitySchema>schema, item);
  const hasErrors = !isEmpty(errors);
  const newNode = {
    ...node,
    status: {
      ...node.status,
      invalid: hasErrors,
      errors: hasErrors ? errors : null,
    },
  };

  return {
    ...state,
    currentSelection: makeTaskSelection(node.id),
    [graphName]: addNewNode(state[graphName], newNode),
    [itemsDictionaryName]: {
      ...itemsDictionary,
      [item.id]: {...item}
    },
    schemas,
  };
}
