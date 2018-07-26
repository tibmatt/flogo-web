
import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { Dictionary, Item, ItemActivityTask } from '@flogo/core';

import { FlowState } from './flow.state';
import { getGraphName, getItemsDictionaryName } from '../utils';
import { determineRunnableStatus } from './views/determine-runnable-status';

import { InsertTaskSelection, HandlerType, TaskSelection, SelectionType } from '../../models';
import { DiagramSelectionType } from '@flogo/packages/diagram';

export const selectFlowState = createFeatureSelector<FlowState>('flow');
export const selectCurrentSelection = createSelector(selectFlowState, (flowState: FlowState) => flowState.currentSelection);
export const selectFlowMetadata = createSelector(selectFlowState, (flowState: FlowState) => flowState.metadata);
export const selectErrorPanelStatus = createSelector(selectFlowState, (flowState: FlowState) => flowState.isErrorPanelOpen);
export const selectDebugPanelOpen = createSelector(selectFlowState, (flowState: FlowState) => flowState.isDebugPanelOpen);
export const selectTriggers = createSelector(selectFlowState, (flowState: FlowState) => flowState.triggers);
export const selectHandlers = createSelector(selectFlowState, (flowState: FlowState) => flowState.handlers);
export const selectApp = createSelector(selectFlowState, flowState => flowState.app);
export const selectActionId = createSelector(selectFlowState, flowState => flowState.id);
export const selectTriggerConfigure = createSelector(selectFlowState, (flowState: FlowState) => flowState.triggerConfigure);
export const selectTaskConfigure = createSelector(selectFlowState, (flowState: FlowState) => flowState.taskConfigure);
export const selectSchemas = createSelector(selectFlowState, (flowState: FlowState) => flowState.schemas);
export const selectLastExecutionResult = createSelector(selectFlowState, (flowState: FlowState) => flowState.lastExecutionResult);
export const selectLastFullExecution = createSelector(selectFlowState, (flowState: FlowState) => flowState.lastFullExecution);
export const selectHasStructureChangedSinceLastRun = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.structureChangedSinceLastFullExecution
);

export const getItems = (handlerType: HandlerType) => {
  const handlerName = getItemsDictionaryName(handlerType);
  return createSelector(selectFlowState, flowState => flowState[handlerName] as Dictionary<Item>);
};

export const getAllItems = createSelector(
  getItems(HandlerType.Main),
  getItems(HandlerType.Error),
  (mainItems, errorItems) => ({mainItems, errorItems}),
);

export const getRunnableState = createSelector(
  getAllItems,
  ({mainItems, errorItems}) => determineRunnableStatus(mainItems, errorItems),
);

export const getCurrentHandlerId = createSelector(
  selectErrorPanelStatus,
  (isErrorPanelOpen) => {
    return isErrorPanelOpen ? HandlerType.Error : HandlerType.Main;
  },
);

export const getCurrentGraph = createSelector(selectFlowState, getCurrentHandlerId, (flowState, currentHandlerId) => {
  return flowState[getGraphName(currentHandlerId)];
});

export const getSelectionForCurrentHandler = createSelector(
  selectCurrentSelection,
  (currentSelection: TaskSelection | InsertTaskSelection) => {
    if (currentSelection && currentSelection.type === SelectionType.Task) {
      return {
        type: DiagramSelectionType.Node,
        taskId: currentSelection.taskId,
        diagramId: currentSelection.handlerType,
      };
    } else if (currentSelection && currentSelection.type === SelectionType.InsertTask) {
      return {
        type: DiagramSelectionType.Insert,
        taskId: currentSelection.parentId,
        diagramId: currentSelection.handlerType,
      };
    } else {
      return null;
    }
  }
);

export const getCurrentHandlerType = createSelector(
  selectCurrentSelection,
  selectFlowState,
  (currentSelection) => {
    if (!currentSelection) {
      return null;
    }
    if (currentSelection.type === SelectionType.Task) {
      return currentSelection.handlerType;
    }
    return null;
  }
);

export const getCurrentItems: MemoizedSelector<FlowState, Dictionary<Item>> = createSelector(
  getCurrentHandlerType,
  selectFlowState,
  (currentHandlerType, flowState) => currentHandlerType ? flowState[getItemsDictionaryName(currentHandlerType)] : null
);

export const getSelectedActivity = createSelector(
  selectCurrentSelection,
  getCurrentItems,
  (currentSelection, currentItems) =>
    currentSelection && currentSelection.type === SelectionType.Task ? currentItems[currentSelection.taskId] as ItemActivityTask : null
);

export const getSelectedActivitySchema = createSelector(
  getSelectedActivity,
  selectSchemas,
  (selectedActivity, schemas) => selectedActivity ? schemas[selectedActivity.ref] : null
);

export const getSelectedActivityExecutionResult = createSelector(
  getSelectedActivity,
  selectLastExecutionResult,
  /* tslint:disable-next-line:triple-equals --> for legacy ids of type number so 1 == '1' */
  (selectedActivity, steps) => selectedActivity && steps ? steps[selectedActivity.id] : null
);

export const getIsRunDisabledForSelectedActivity = createSelector(
  getCurrentHandlerType,
  getRunnableState,
  selectLastFullExecution,
  selectHasStructureChangedSinceLastRun,
  selectCurrentSelection,
  (handlerType, runnableInfo, lastFullExecution, structureHasChanged) => {
    const isErrorHandler = handlerType === HandlerType.Error;
    const isRunDisabled = runnableInfo && runnableInfo.disabled;
    const hasExecuted = lastFullExecution && lastFullExecution.processId;
    return isErrorHandler || structureHasChanged || isRunDisabled || !hasExecuted;
  }
);
