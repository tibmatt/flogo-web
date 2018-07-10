import { FlowState } from '@flogo/flow/core/state';
import { Action as ActionSchema } from '@flogo/core';

export function subflowSchemaUpdate(state: FlowState, payload: { newSubflowSchema?: ActionSchema }) {
  const { newSubflowSchema } = payload;
  if (!newSubflowSchema) {
    return state;
  }
  state = {
    ...state,
    linkedSubflows: {
      ...state.linkedSubflows,
      [newSubflowSchema.id]: { ...newSubflowSchema },
    }
  };
  return state;
}
