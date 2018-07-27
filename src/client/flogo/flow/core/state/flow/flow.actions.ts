import { Action } from '@ngrx/store';
import { Action as ActionSchema, ActivitySchema, Dictionary, GraphNode, Item, ItemTask, StepAttribute } from '@flogo/core';
import { HandlerType } from '../../models/handler-type';
import { FlowState } from './flow.state';

export enum ActionType {
  Init = '[Flow] Init',
  SelectCreateItem = '[Flow] Select create task',
  TaskItemCreated = '[Flow] Task created',
  ConfigureItem = '[Flow] Configure item',
  SelectItem = '[Flow] Select item',
  RemoveItem = '[Flow] Remove item',
  CreateBranch = '[Flow] Create branch',
  ItemUpdated = '[Flow] Item updated',
  CommitItemConfiguration = '[Flow] Commit item configuration',
  CancelItemConfiguration = '[Flow] Cancel item configuration',
  ClearSelection = '[Flow] Clear selection',
  ExecutionWillStart = '[Run Flow] Execution will start',
  ExecutionUpdated = '[Run Flow] Execution updated',
  ExecutionStepsUpdate = '[Run Flow] Steps update',
  ErrorPanelStatusChange = '[Flow] Error panel status change',
  DebugPanelStatusChange = '[Flow][Debug panel] Debug panel status change',
  ActivityInstalled = '[Flow] Activity installed'
}

interface BaseFlowAction extends Action {
  readonly type: ActionType;
}

export class Init implements BaseFlowAction {
  readonly type = ActionType.Init;
  constructor(public payload: FlowState) {}
}

export class SelectItem implements BaseFlowAction {
  readonly type = ActionType.SelectItem;
  constructor(public payload: { handlerType: HandlerType, itemId: string } | null) {}
}

export class SelectCreateItem implements BaseFlowAction {
  readonly type = ActionType.SelectCreateItem;
  constructor(public payload: { handlerType: HandlerType, parentItemId: string }) {}
}

export class ClearSelection implements BaseFlowAction {
  readonly type = ActionType.ClearSelection;
  constructor() {}
}

export class CreateBranch implements BaseFlowAction {
  readonly type = ActionType.CreateBranch;
  constructor(public payload: { handlerType: HandlerType, parentId: string, newBranchId: string }) {}
}

export class TaskItemCreated implements BaseFlowAction {
  readonly type = ActionType.TaskItemCreated;
  constructor(public payload: {
    handlerType: HandlerType,
    item: ItemTask,
    node: GraphNode,
    subflowSchema?: ActionSchema
  }) {}
}

export class RemoveItem implements BaseFlowAction {
  readonly type = ActionType.RemoveItem;
  constructor(public payload: { handlerType: HandlerType, itemId: string }) {}
}

export class ItemUpdated implements BaseFlowAction {
  readonly type = ActionType.ItemUpdated;
  constructor(public payload: { handlerType: HandlerType, item: {id: string} & Partial<Item>, node?: {id: string} & Partial<GraphNode> }) {}
}

export class ConfigureItem implements BaseFlowAction {
  readonly type = ActionType.ConfigureItem;
  constructor(public payload: { itemId: string; }) {}
}

export class CommitItemConfiguration implements BaseFlowAction {
  readonly type = ActionType.CommitItemConfiguration;
  constructor(public payload: { handlerType: HandlerType, item: {id: string} & Partial<Item>, newSubflowSchema?: ActionSchema }) {}
}

export class CancelItemConfiguration implements BaseFlowAction {
  readonly type = ActionType.CancelItemConfiguration;
}

export class ExecutionWillStart implements BaseFlowAction {
  readonly type = ActionType.ExecutionWillStart;
  constructor() {}
}

export class ExecutionStateUpdated implements BaseFlowAction {
  readonly type = ActionType.ExecutionUpdated;
  constructor(public payload: { changes: { mainGraphNodes?: Dictionary<GraphNode>, errorGraphNodes?: Dictionary<GraphNode> } }) {}
}

export class ExecutionStepsUpdated implements BaseFlowAction {
  readonly type = ActionType.ExecutionStepsUpdate;
  constructor(public payload: { steps: Dictionary<Dictionary<StepAttribute>> } ) {}
}

export class ErrorPanelStatusChange implements BaseFlowAction {
  readonly type = ActionType.ErrorPanelStatusChange;
  constructor(public payload: { isOpen: boolean }) {}
}

export class DebugPanelStatusChange implements BaseFlowAction {
  readonly type = ActionType.DebugPanelStatusChange;
  constructor(public payload: { isOpen: boolean }) {}
}

export class ActivityInstalled implements BaseFlowAction {
  readonly type = ActionType.ActivityInstalled;
  constructor(public payload: ActivitySchema) {}
}

export type ActionsUnion =
  | Init
  | SelectCreateItem
  | TaskItemCreated
  | ConfigureItem
  | ClearSelection
  | SelectItem
  | RemoveItem
  | CreateBranch
  | ItemUpdated
  | CommitItemConfiguration
  | CancelItemConfiguration
  | ExecutionWillStart
  | ExecutionStepsUpdated
  | ExecutionStateUpdated
  | ErrorPanelStatusChange
  | DebugPanelStatusChange
  | ActivityInstalled;
