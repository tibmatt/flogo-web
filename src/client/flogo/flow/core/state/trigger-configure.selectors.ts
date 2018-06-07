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

const selectTriggersForm = createSelector(selectTriggerConfigure, triggerConfigureState => triggerConfigureState.triggersForm);
export const getTriggerStatuses = createSelector(selectTriggersForm, (triggersForm): TriggerStatus[] => Object
  .values(triggersForm.controls)
  .map((control): TriggerStatus => {
    return {
      id: control.value.id,
      name: control.value.settings.name,
      isValid: control.isValid,
      isDirty: control.isDirty,
    };
  }));

const getCurrentTriggerForm = createSelector(
  selectTriggersForm,
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
