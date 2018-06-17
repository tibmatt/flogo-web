import { TriggerConfigureState } from '@flogo/flow/core';

export function mapperStatusReducer(
  state: TriggerConfigureState,
  groupId: string,
  { isValid, isDirty }: { isValid: boolean, isDirty: boolean }
) {
  const tab = state.tabs[groupId];
  // tslint:disable-next-line:triple-equals - we care if values are truthy or falsy, we're okay with non strict equality
  if (tab.isValid == isValid && tab.isDirty == isDirty) {
    return state;
  }
  return {
    ...state,
    tabs: {
      ...state.tabs,
      [groupId]: {
        ...tab,
        isValid,
        isDirty,
      }
    }
  };
}
