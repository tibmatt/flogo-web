import { createSelector } from '@ngrx/store';
import { getProfileType } from '../../../../shared/utils';
import {
  selectActionId, selectApp, selectFlowMetadata, selectTriggers, selectHandlers, selectCurrentSelection
} from '../flow/flow.selectors';
import { TriggersState } from '../../../triggers/interfaces/triggers-state';
import { triggersToRenderableTriggers } from '../../../triggers/models/triggers-to-renderable-triggers';
import { SelectionType } from '../../models/index';

export const getRenderableTriggers = createSelector(
  selectHandlers,
  selectTriggers,
  (handlers, triggers) => triggersToRenderableTriggers(handlers, triggers)
);

export const selectAppInfo = createSelector(
  selectApp,
  (app) => {
    if (!app) {
      return {
        appId: null,
        appProfileType: null,
      };
    }
    return {
      appId: app.id,
      appProfileType: getProfileType(app),
    };
  },
);

export const selectCurrentTrigger = createSelector(
  selectCurrentSelection,
  selectTriggers,
  selectHandlers,
  (currentSelection, triggers, handlers) => {
    if (!currentSelection || currentSelection.type !== SelectionType.Trigger) {
      return null;
    }
    const { triggerId } = currentSelection;
    return {
      ...triggers[triggerId],
      handler: handlers[triggerId],
    };
  },
);

export const getTriggersState = createSelector(
  selectAppInfo,
  selectActionId,
  getRenderableTriggers,
  selectFlowMetadata,
  selectCurrentTrigger,
  (appInfo, actionId, triggers, flowMetadata, currentTrigger): TriggersState => {
    return {
      appId: appInfo.appId,
      actionId,
      appProfileType: appInfo.appProfileType,
      triggers,
      flowMetadata,
      currentTrigger,
    };
  },
);
