import { FlowState } from '@flogo/flow/core/state';
import { Action as ActionSchema, ItemSubflow } from '@flogo/core';

export const getLinkedSubflow = (t: ItemSubflow) => t.settings && t.settings.flowPath;

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

export function removeSubschemaIfNotUsed(state: FlowState, subflowId: string) {
  if (isSubflowUsedAgain(state, subflowId)) {
    const {[subflowId]: subflowToRemove, ...subflows } = state.linkedSubflows;
    state = { ...state, linkedSubflows: subflows };
  }
  return state;
}

function isSubflowUsedAgain(state: FlowState, subflowId: string) {
  const isReferencedSubflow = (t: ItemSubflow) => getLinkedSubflow(t) === subflowId;
  return Boolean(
    Object.values(state.mainItems).find(isReferencedSubflow)
          || Object.values(state.errorItems).find(isReferencedSubflow)
  );
}
