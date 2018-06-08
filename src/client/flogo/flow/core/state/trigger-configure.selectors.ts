import { createSelector } from '@ngrx/store';
import { FormGroupState } from 'ngrx-forms';
// todo: move to shared location
import { TriggerStatus } from '../../triggers/configurator/interfaces';
import { selectFlowMetadata, selectHandlers, selectTriggerConfigure, selectTriggers } from './flow.selectors';
import { TriggerConfigureGroup } from '../interfaces';
import { triggerControlsToTabs } from '../models/trigger-configure/trigger-controls-to-tabs';

const getConfigurableTriggerDetails = createSelector(
  selectHandlers,
  selectTriggers,
  (handlers, triggers) => {
    return Object.values(handlers).map(handler => ({
      trigger: triggers[handler.triggerId],
      handler,
    }));
  }
);

export const selectCurrentTriggerId = createSelector(
  selectTriggerConfigure,
  triggerConfigureState => triggerConfigureState.selectedTriggerId
);

const selectTriggerConfigureTriggers = createSelector(selectTriggerConfigure, triggerConfigureState => triggerConfigureState.triggers);
export const getTriggerStatuses = createSelector(selectTriggerConfigureTriggers, (triggers): TriggerStatus[] => Object
  .keys(triggers)
  .map((triggerId): TriggerStatus => {
    return {
      id: triggerId,
      name: triggers[triggerId].name,
      isValid: triggers[triggerId].isValid,
      isDirty: triggers[triggerId].isDirty,
    };
  }));

const getCurrentTriggerForm = createSelector(
  selectTriggerConfigureTriggers,
  selectCurrentTriggerId,
  (triggersFormState, currentTriggerId) => {
    return triggersFormState.controls[currentTriggerId] as FormGroupState<TriggerConfigureGroup>;
  }
);

export const getCurrentTabId = createSelector(selectTriggerConfigure, (triggerConfigure) => {
  return triggerConfigure ? triggerConfigure.currentTab : null;
});

export const getTabs = createSelector(
  getCurrentTriggerForm,
  (currentTriggerFormState) => {
    if (!currentTriggerFormState || !currentTriggerFormState.controls) {
      return [];
    }
    return triggerControlsToTabs(currentTriggerFormState.controls);
  }
);

export const getHasTriggersConfigure = createSelector(selectTriggerConfigure, triggerConfigure => !!triggerConfigure);

export const getConfigureModalState = createSelector(
  selectTriggerConfigure,
  selectFlowMetadata,
  getConfigurableTriggerDetails,
  (triggerConfigure, flowMetadata, triggers) => {
    return {
      triggers,
      flowMetadata,
      triggerConfigure
    };
  }
);
