import { createSelector, createFeatureSelector } from '@ngrx/store';
import {Dictionary, Item} from '@flogo/core';
import { HandlerType } from '../../models/handler-type';
import { FlowState } from './flow.state';
import { getGraphName, getItemsDictionaryName } from '../utils';
import { determineRunnableStatus } from './views/determine-runnable-status';
import {InsertTaskSelection, TaskSelection, SelectionType} from '../../models/selection';
import {DiagramSelectionType} from '@flogo/packages/diagram/interfaces';

export const selectFlowState = createFeatureSelector<FlowState>('flow');
export const selectCurrentSelection = createSelector(selectFlowState, (flowState: FlowState) => flowState.currentSelection);
export const selectFlowMetadata = createSelector(selectFlowState, (flowState: FlowState) => flowState.metadata);
export const selectErrorPanelStatus = createSelector(selectFlowState, (flowState: FlowState) => flowState.isErrorPanelOpen);
export const selectTriggers = createSelector(selectFlowState, (flowState: FlowState) => flowState.triggers);
export const selectHandlers = createSelector(selectFlowState, (flowState: FlowState) => flowState.handlers);
export const selectApp = createSelector(selectFlowState, flowState => flowState.app);
export const selectActionId = createSelector(selectFlowState, flowState => flowState.id);
export const selectTriggerConfigure = createSelector(selectFlowState, (flowState: FlowState) => flowState.triggerConfigure);
export const selectTaskConfigure = createSelector(selectFlowState, (flowState: FlowState) => flowState.taskConfigure);
export const selectSchemas = createSelector(selectFlowState, (flowState: FlowState) => flowState.schemas);

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

export const getCurrentItems = createSelector(
  getCurrentHandlerType,
  selectFlowState,
  (currentHandlerType, flowState) => currentHandlerType ? flowState[getItemsDictionaryName(currentHandlerType)] : null
);

export const getSelectedActivity = createSelector(
  selectCurrentSelection,
  getCurrentItems,
  (currentSelection, currentItems) =>
    currentSelection && currentSelection.type === SelectionType.Task ? currentItems[currentSelection.taskId] : null
);

export const getSelectedActivitySchema = createSelector(
  getSelectedActivity,
  selectSchemas,
  (selectedActivity, schemas) => selectedActivity ? schemas[selectedActivity.ref] : null
);

