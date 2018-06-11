import { Dictionary, FLOGO_PROFILE_TYPE, TriggerSchema } from '@flogo/core';
import { FlowState } from '@flogo/flow/core/state/flow/flow.state';
import { getProfileType } from '@flogo/shared/utils';
import { OpenConfigureWithSelection } from '../trigger-configure.actions';
import {
  Trigger,
  TriggerConfigureState,
  TriggerConfigureTab,
  TriggerConfigureTabType,
  TriggerConfigureTrigger
} from '@flogo/flow/core/interfaces';
import { getDeviceTabs, getMicroServiceTabs } from './tab-base-by-profile';
import { setEnabledStatusToTabs } from '@flogo/flow/core/state/triggers-configure/cases/set-enabled-status-to-tabs';

export function init(flowState: FlowState, payload: OpenConfigureWithSelection['payload']): FlowState {
  const { triggerId: selectedTriggerId, triggerSchemas } = payload;
  let triggerConfigureState = {
    isOpen: true,
    selectedTriggerId,
    currentTab: <TriggerConfigureTabType> 'settings',
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
  triggerConfigureState = setEnabledStatusToTabs(triggerConfigureState);
  return {
    ...flowState,
    triggerConfigure: triggerConfigureState,
  };
}

function initTriggerConfigureState(
  baseState: TriggerConfigureState,
  appTriggers: Trigger[],
  triggersSchemas: Dictionary<TriggerSchema>,
  appProfileType: FLOGO_PROFILE_TYPE,
): TriggerConfigureState {
  const triggersForConfigure: Dictionary<TriggerConfigureTrigger> = {};
  let allTabs: Dictionary<TriggerConfigureTab> = {};
  const fields = {};
  appTriggers
    .forEach(trigger => {
      const tabsForTrigger = createTabsForTrigger(trigger.id, appProfileType);
      allTabs = { ...allTabs, ...tabsForTrigger };
      triggersForConfigure[trigger.id] = createTriggerState(trigger, [...Object.keys(tabsForTrigger)]);
      // fields = createFields(trigger, triggersSchemas[trigger.ref])
    });
  return {
    ...baseState,
    triggers: triggersForConfigure,
    tabs: allTabs,
    fields,
  };
}

function createTabsForTrigger(triggerId: string, appProfileType: FLOGO_PROFILE_TYPE): Dictionary<TriggerConfigureTab> {
  const getTabBases = appProfileType === FLOGO_PROFILE_TYPE.MICRO_SERVICE ? getMicroServiceTabs : getDeviceTabs;
  return getTabBases().reduce((tabs, tabBase) => {
    tabs[`${triggerId}.${tabBase.type}`] = {
      triggerId,
      ...tabBase,
      isValid: true,
      isDirty: false,
      isEnabled: true,
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
    isDirty: false
  };
}

