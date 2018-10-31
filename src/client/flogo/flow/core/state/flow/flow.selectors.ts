
import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import {
  ContribSchema, Dictionary, FLOGO_CONTRIB_TYPE_VALUES, Item, ItemActivityTask, FLOGO_TASK_TYPE,
   FlowGraph
} from '@flogo/core';
import { remove } from 'lodash';

import { FlowState } from './flow.state';
import {getGraphName, getItemsDictionaryName, nodesContainErrors} from '../utils';
import { determineRunnableStatus } from './views/determine-runnable-status';

import { InsertTaskSelection, HandlerType, TaskSelection, SelectionType } from '../../models';
import { DiagramSelectionType } from '@flogo/packages/diagram/interfaces';
import { Activity } from '@flogo/flow/task-add';
import { getProfileType } from '@flogo/shared/utils';
import { CONTRIB_REF_PLACEHOLDER } from '@flogo/core/constants';
import { NodeDictionary } from '@flogo/core/interfaces/graph/graph';

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
  return flowState[getGraphName(currentHandlerId)] as FlowGraph;
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

export const getCurrentNodes: MemoizedSelector<FlowState, NodeDictionary> = createSelector(
  getCurrentHandlerType,
  selectFlowState,
  (currentHandlerType, flowState) => currentHandlerType ?
      flowState[getGraphName(currentHandlerType)].nodes as NodeDictionary
    : null
);


const isTaskSelection = (selection): selection is TaskSelection => selection && selection.type === SelectionType.Task;
export const getSelectedActivity = createSelector(
  selectCurrentSelection,
  getCurrentItems,
  (currentSelection, currentItems) => {
    if (isTaskSelection(currentSelection) && currentItems[currentSelection.taskId]
      && currentItems[currentSelection.taskId].type !== FLOGO_TASK_TYPE.TASK_BRANCH) {
      return currentItems[currentSelection.taskId] as ItemActivityTask;
    }
    return null;
  }
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

export const getFlowHasRun = createSelector(
  selectLastFullExecution,
  lastFullExecution => lastFullExecution && lastFullExecution.processId,
);

export const getIsRunDisabledForSelectedActivity = createSelector(
  getCurrentHandlerType,
  getRunnableState,
  getFlowHasRun,
  selectHasStructureChangedSinceLastRun,
  (handlerType, runnableInfo, flowHasRun, structureHasChanged) => {
    const isErrorHandler = handlerType === HandlerType.Error;
    const isRunDisabled = runnableInfo && runnableInfo.disabled;
    return isErrorHandler || structureHasChanged || isRunDisabled || !flowHasRun;
  },
);

export const isCurrentSelectionRoot = createSelector(
  getSelectedActivity,
  getCurrentGraph,
  (activity, currentGraph): boolean => activity && currentGraph && currentGraph.rootId === activity.id
);

export const getIsRestartableTask = createSelector(
  getCurrentHandlerType,
  isCurrentSelectionRoot,
  (handlerType, isRoot) => handlerType !== HandlerType.Error && !isRoot,
);

export const getCurrentActivityExecutionErrors = createSelector(
  getSelectedActivity,
  getCurrentNodes,
  (activity, nodes) => {
    return activity && nodes ? nodes[activity.id].status.executionErrored : null;
  },
);

export const getAllNodes = createSelector(
  selectFlowState,
  (flowState) => {
    return {
      errorNodes: flowState.errorGraph.nodes,
      mainNodes: flowState.mainGraph.nodes
    };
  });

export const getGraph = (handlerType: HandlerType) => {
  const graphName = getGraphName(handlerType);
  return createSelector(selectFlowState, flowState => flowState[graphName] as FlowGraph);
};

const getMainGraphNodes = createSelector(getGraph(HandlerType.Main), mainGraph => mainGraph.nodes);
const getErrorGraphNodes = createSelector(getGraph(HandlerType.Error), errorGraph => errorGraph.nodes);
export const getPrimaryFlowHasExecutionErrors = createSelector(getMainGraphNodes, nodes => nodesContainErrors(nodes));
export const getErrorFlowHasExecutionErrors = createSelector(getErrorGraphNodes, nodes => nodesContainErrors(nodes));

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

export const selectAppAndFlowInfo = createSelector(
  selectAppInfo,
  selectActionId,
  (appInfo, actionId) => ({...appInfo, actionId})
);

export const getInstalledActivities = createSelector(
  selectSchemas,
  (schemas: Dictionary<ContribSchema>): Activity[] => {
    const activities = Object.values(schemas)
      .filter(schema => schema.type === FLOGO_CONTRIB_TYPE_VALUES.DEVICE_ACTIVITY
        || schema.type === FLOGO_CONTRIB_TYPE_VALUES.MICRO_SERVICE_ACTIVITY)
      .map(schema => ({
        title: schema.title,
        ref: schema.ref
      }));
    const subflowActivity = remove(activities, activity => activity.ref === CONTRIB_REF_PLACEHOLDER.REF_SUBFLOW).pop();
    if (subflowActivity) {
      activities.unshift(subflowActivity);
    }
    return activities;
  }
);
