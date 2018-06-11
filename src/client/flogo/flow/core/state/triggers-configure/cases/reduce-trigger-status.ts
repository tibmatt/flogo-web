import { TriggerConfigureState } from '@flogo/flow/core';
import { reduceGroupStatus } from './group-utils';

function reduceTriggerStatus(state: TriggerConfigureState, triggerId: string): TriggerConfigureState {
  const prevTriggerState = state.triggers[triggerId];
  const tabs = prevTriggerState.tabs.map(tabId => state.tabs[tabId]);
  const triggerState = reduceGroupStatus(prevTriggerState, tabs);
  if (triggerState !== prevTriggerState) {
    return {
      ...state,
      triggers: {
        ...state.triggers,
        [triggerId]: triggerState,
      },
    };
  }
}
