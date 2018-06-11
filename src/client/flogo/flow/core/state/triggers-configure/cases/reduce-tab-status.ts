import { TriggerConfigureState } from '@flogo/flow/core';
import { reduceGroupStatus } from './group-utils';

function reduceTabStatus(state: TriggerConfigureState, fieldGroupId: string): TriggerConfigureState {
  const fields = Object.values(state.fields[fieldGroupId]);
  const prevTabState = state.tabs[fieldGroupId];
  const nextTabState = reduceGroupStatus(prevTabState, fields);
  if (nextTabState !== prevTabState) {
    return {
      ...state,
      tabs: {
        ...state.tabs,
        [fieldGroupId]: nextTabState,
      },
    };
  }
}
