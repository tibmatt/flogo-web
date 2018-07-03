import { createSelector, select, Store } from '@ngrx/store';
import { switchMap, map } from 'rxjs/operators';
import { of as observableOf } from 'rxjs';

import { FlowState, selectActionId, selectApp } from '@flogo/flow/core/state';
// todo: move to shared location
import { TriggerStatus, CurrentTriggerState } from '../../../triggers/configurator/interfaces';
import { selectFlowMetadata, selectHandlers, selectTriggerConfigure, selectTriggers } from '../flow/flow.selectors';

import {createTriggerConfigureFields} from './cases/create-trigger-configure-fields';


export const getSchemas = createSelector(selectTriggerConfigure, state => state.schemas);
export const getAllTabs = createSelector(selectTriggerConfigure, state => state.tabs);

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
  triggerConfigureState => triggerConfigureState ? triggerConfigureState.selectedTriggerId : null
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

const getCurrentTriggerConfig = createSelector(
  selectTriggerConfigureTriggers,
  selectCurrentTriggerId,
  (triggersState, currentTriggerId) => {
    return triggersState[currentTriggerId];
  }
);

export const getCurrentTabType = createSelector(selectTriggerConfigure, (triggerConfigure) => {
  return triggerConfigure ? triggerConfigure.currentTab : null;
});

const selectCurrentTabs = createSelector(
  getCurrentTriggerConfig,
  getAllTabs,
  (currentTrigger, tabs) => currentTrigger.tabs.map(tabId => tabs[tabId]),
);

export const getCurrentTabs = (store: Store<FlowState>) => {
  const empty$ = observableOf([]);
  const currentTabs$ = store.select(selectCurrentTabs);
  return store.pipe(
    select(getHasTriggersConfigure),
    switchMap(isTriggerInitialized => isTriggerInitialized ? currentTabs$ : empty$)
  );
};

export const getHasTriggersConfigure = createSelector(selectTriggerConfigure, triggerConfigure => !!triggerConfigure);

export const getCurrentTriggerIsSaving = (store: Store<FlowState>) => {
  const currentSavingState$ = store.select(
    createSelector(
      selectTriggerConfigureTriggers,
      selectCurrentTriggerId,
      (triggers, triggerId) => triggers[triggerId].isSaving,
    ),
  );
  return store.pipe(
    select(getHasTriggersConfigure),
    switchMap(isTriggerInitialized => isTriggerInitialized ? currentSavingState$ : observableOf(false)),
  );
};

export const getCurrentTriggerOverallStatus = (store: Store<FlowState>) => {
  const empty$ = observableOf({ isDirty: false, isValid: true });
  const currentTabs$ = store.pipe(
    select(selectCurrentTabs),
    map((currentTabs) => {
      return {
        isDirty: !!currentTabs.find(tab => tab.isDirty),
        isValid: !currentTabs.find(tab => !tab.isValid),
        isPending: !!currentTabs.find(tab => tab.isPending)
      };
    })
  );
  return store.pipe(
    select(getHasTriggersConfigure),
    switchMap(isTriggerInitialized => isTriggerInitialized ? currentTabs$ : empty$),
  );
};

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

export const getCurrentSchema = createSelector(
  selectTriggers,
  selectCurrentTriggerId,
  getSchemas, (triggers, currentTriggerId, schemas) => {
    const trigger = triggers[currentTriggerId];
    return schemas[trigger.ref];
  }
);

const getCurrentTrigger = createSelector(
  selectCurrentTriggerId,
  selectTriggers,
  (currentTriggerId, triggers) => triggers[currentTriggerId],
);

const getCurrentHandler = createSelector(
  selectCurrentTriggerId,
  selectHandlers,
  (currentTriggerId, handlers) => handlers[currentTriggerId],
);

export const getConfigureState = createSelector(
  selectFlowMetadata,
  getCurrentSchema,
  getCurrentTrigger,
  getCurrentHandler,
  selectApp,
  (flowMetadata, schema, trigger, handler, app): CurrentTriggerState => {
    return {
      flowMetadata,
      schema,
      trigger,
      handler,
      appId: app.id,
      appProperties: app.properties,
      fields: createTriggerConfigureFields(trigger, handler, schema),
    };
  },
);

export const getSaveInfo = createSelector(
  selectActionId,
  selectCurrentTriggerId,
  getCurrentHandler,
  (actionId, triggerId, handler) => ({ actionId, triggerId, handler }));
