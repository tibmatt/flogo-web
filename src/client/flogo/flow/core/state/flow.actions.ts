import { Action } from '@ngrx/store';
import { ContribSchema, Dictionary, GraphNode, Item, ItemTask } from '@flogo/core';
import { HandlerType } from '../models/handler-type';
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
  ClearSelection = '[Flow] Clear selection',
  ExecutionWillStart = '[Flow] Execution will start',
  ExecutionUpdated = '[Flow] Execution updated',
  ErrorPanelStatusChange = '[Flow] Error panel status change',
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
  constructor(public payload: { handlerType: HandlerType, item: ItemTask, node: GraphNode, schema: ContribSchema}) {}
}

export class RemoveItem implements BaseFlowAction {
  readonly type = ActionType.RemoveItem;
  constructor(public payload: { handlerType: HandlerType, itemId: string }) {}
}

export class ItemUpdated implements BaseFlowAction {
  readonly type = ActionType.ItemUpdated;
  constructor(public payload: { handlerType: HandlerType, item: {id: string} & Partial<Item>, node?: Partial<GraphNode> }) {}
}

export class ConfigureItem implements BaseFlowAction {
  readonly type = ActionType.ConfigureItem;
  constructor(public payload: { handlerType: HandlerType, item: ItemTask, node: GraphNode, schema: ContribSchema }) {}
}

export class ExecutionWillStart implements BaseFlowAction {
  readonly type = ActionType.ExecutionWillStart;
  constructor() {}
}

export class ExecutionStateUpdated implements BaseFlowAction {
  readonly type = ActionType.ExecutionUpdated;
  constructor(public payload: { changes: { mainGraphNodes?: Dictionary<GraphNode>, errorGraphNodes?: Dictionary<GraphNode> } }) {}
}

export class ErrorPanelStatusChange implements BaseFlowAction {
  readonly type = ActionType.ErrorPanelStatusChange;
  constructor(public payload: { isOpen: boolean }) {}
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
  | ExecutionWillStart
  | ExecutionStateUpdated
  | ErrorPanelStatusChange;
