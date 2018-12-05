import { FlowState } from '@flogo-web/client/flow/core/state';
import { Action as ActionSchema } from '@flogo-web/client/core';

export function subflowSchemaUpdate(
  state: FlowState,
  payload: { newSubflowSchema?: ActionSchema }
) {
  const { newSubflowSchema } = payload;
  if (!newSubflowSchema) {
    return state;
  }
  state = {
    ...state,
    linkedSubflows: {
      ...state.linkedSubflows,
      [newSubflowSchema.id]: { ...newSubflowSchema },
    },
  };
  return state;
}
