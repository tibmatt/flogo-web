import { TriggerConfigureState } from '@flogo/flow/core';

export function mapperStatusReducer(
  state: TriggerConfigureState,
  groupId: string,
  nextStatus: { isValid: boolean, isDirty: boolean, isEnabled?: boolean }
) {
  const prevTab = state.tabs[groupId];
  const nextTab = {
    ...prevTab,
    ...nextStatus,
  };
  // Return the original state in case of non microservice profiles where input and output mappings are not applicable
  if (!prevTab) {
    return state;
  }
  // tslint:disable-next-line:triple-equals - we care if values are truthy or falsy, we're okay with non strict equality
  if (prevTab.isValid == nextTab.isValid && prevTab.isDirty == nextTab.isDirty && prevTab.isEnabled === nextTab.isEnabled) {
    return state;
  }
  return {
    ...state,
    tabs: {
      ...state.tabs,
      [groupId]: nextTab,
    }
  };
}
