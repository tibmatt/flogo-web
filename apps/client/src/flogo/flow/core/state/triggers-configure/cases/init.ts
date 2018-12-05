import { Dictionary, FLOGO_PROFILE_TYPE, TriggerSchema } from '@flogo-web/client/core';
import { FlowState } from '@flogo-web/client/flow/core/state/flow/flow.state';
import { getProfileType } from '@flogo-web/client/shared/utils';
import { OpenConfigureWithSelection } from '../trigger-configure.actions';
import {
  Trigger,
  TriggerConfigureState,
  TriggerConfigureTab,
  TriggerConfigureTabType,
  TriggerConfigureTrigger,
} from '@flogo-web/client/flow/core/interfaces';
import { getDeviceTabs, getMicroServiceTabs } from './tab-base-by-profile';
import { setEnabledStatusToTabs } from './set-enabled-status-to-tabs';

export function init(
  flowState: FlowState,
  payload: OpenConfigureWithSelection['payload']
): TriggerConfigureState {
  const { triggerId: selectedTriggerId, triggerSchemas } = payload;
  let triggerConfigureState = {
    isOpen: true,
    selectedTriggerId,
    currentTab: TriggerConfigureTabType.Settings,
    schemas: payload.triggerSchemas,
    triggers: null,
    tabs: null,
    fields: null,
  };
  triggerConfigureState = initTriggerConfigureState(
    triggerConfigureState,
    Object.values(flowState.triggers),
    triggerSchemas,
    getProfileType(flowState.app)
  );
  return setEnabledStatusToTabs(triggerConfigureState);
}

function initTriggerConfigureState(
  baseState: TriggerConfigureState,
  appTriggers: Trigger[],
  triggersSchemas: Dictionary<TriggerSchema>,
  appProfileType: FLOGO_PROFILE_TYPE
): TriggerConfigureState {
  const triggersForConfigure: Dictionary<TriggerConfigureTrigger> = {};
  let allTabs: Dictionary<TriggerConfigureTab> = {};
  const fields = {};
  appTriggers.forEach(trigger => {
    const tabsForTrigger = createTabsForTrigger(trigger.id, appProfileType);
    allTabs = { ...allTabs, ...tabsForTrigger };
    triggersForConfigure[trigger.id] = createTriggerState(trigger, [
      ...Object.keys(tabsForTrigger),
    ]);
  });
  return {
    ...baseState,
    triggers: triggersForConfigure,
    tabs: allTabs,
    fields,
  };
}

function createTabsForTrigger(
  triggerId: string,
  appProfileType: FLOGO_PROFILE_TYPE
): Dictionary<TriggerConfigureTab> {
  const getTabBases =
    appProfileType === FLOGO_PROFILE_TYPE.MICRO_SERVICE
      ? getMicroServiceTabs
      : getDeviceTabs;
  return getTabBases().reduce((tabs, tabBase) => {
    tabs[`${triggerId}.${tabBase.type}`] = {
      triggerId,
      ...tabBase,
      isValid: true,
      isDirty: false,
      isEnabled: true,
      isPending: false,
    };
    return tabs;
  }, {});
}

function createTriggerState(trigger: Trigger, tabIds: string[]): TriggerConfigureTrigger {
  return {
    id: trigger.id,
    name: trigger.name,
    tabs: tabIds,
    isValid: true,
    isDirty: false,
    isSaving: false,
  };
}
