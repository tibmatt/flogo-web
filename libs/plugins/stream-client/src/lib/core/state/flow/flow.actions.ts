import { Action } from '@ngrx/store';
import { Resource, ActivitySchema } from '@flogo-web/core';
import { Dictionary, GraphNode, StepAttribute } from '@flogo-web/lib-client/core';
import { Item, ItemTask, StreamParams } from '../../interfaces/flow';
import { HandlerType } from '../../models';
import { FlowState } from './flow.state';

export enum ActionType {
  Init = '[Flow] Init',
  SelectCreateItem = '[Flow] Select create task',
  CancelCreateItem = '[Flow] Cancel create task',
  TaskItemCreated = '[Flow] Task created',
  ConfigureItem = '[Flow] Configure item',
  SelectItem = '[Flow] Select item',
  RemoveItem = '[Flow] Remove item',
  CreateBranch = '[Flow] Create branch',
  ItemUpdated = '[Flow] Item updated',
  CommitItemConfiguration = '[Flow] Commit item configuration',
  CancelItemConfiguration = '[Flow] Cancel item configuration',
  UpdateMetadata = '[Stream] Update Metadata',
  ClearSelection = '[Flow] Clear selection',
  RunFromStart = '[Run Flow] Run from start',
  RunFromTask = '[Run Flow] Run from tile',
  NewExecutionRegistered = '[Run Flow] New execution registered',
  NewProcessRanFromStart = '[Run Flow] New process started from beginning',
  ExecutionUpdated = '[Run Flow] Execution updated',
  ExecutionStepsUpdate = '[Run Flow] Steps update',
  ErrorPanelStatusChange = '[Flow] Error panel status change',
  DebugPanelStatusChange = '[Flow][Debug panel] Debug panel status change',
  FlowSaveSuccess = '[Flow] Save success',
  ActivityInstalled = '[Flow] Activity installed',
}

interface BaseStreamAction extends Action {
  readonly type: ActionType;
}

export class Init implements BaseStreamAction {
  readonly type = ActionType.Init;
  constructor(public payload: FlowState) {}
}

export class SelectItem implements BaseStreamAction {
  readonly type = ActionType.SelectItem;
  constructor(public payload: { handlerType: HandlerType; itemId: string } | null) {}
}

export class SelectCreateItem implements BaseStreamAction {
  readonly type = ActionType.SelectCreateItem;
  constructor(public payload: { handlerType: HandlerType; parentItemId: string }) {}
}

export class ClearSelection implements BaseStreamAction {
  readonly type = ActionType.ClearSelection;
  constructor() {}
}

export class CreateBranch implements BaseStreamAction {
  readonly type = ActionType.CreateBranch;
  constructor(
    public payload: {
      handlerType: HandlerType;
      parentId: string;
      newBranchId: string;
    }
  ) {}
}

export class TaskItemCreated implements BaseStreamAction {
  readonly type = ActionType.TaskItemCreated;
  constructor(
    public payload: {
      handlerType: HandlerType;
      item: ItemTask;
      node: GraphNode;
      subflowSchema?: Resource;
    }
  ) {}
}

export class RemoveItem implements BaseStreamAction {
  readonly type = ActionType.RemoveItem;
  constructor(public payload: { handlerType: HandlerType; itemId: string }) {}
}

export class ItemUpdated implements BaseStreamAction {
  readonly type = ActionType.ItemUpdated;
  constructor(
    public payload: {
      handlerType: HandlerType;
      item: { id: string } & Partial<Item>;
      node?: { id: string } & Partial<GraphNode>;
    }
  ) {}
}

export class ConfigureItem implements BaseStreamAction {
  readonly type = ActionType.ConfigureItem;
  constructor(public payload: { itemId: string }) {}
}

export class CommitItemConfiguration implements BaseStreamAction {
  readonly type = ActionType.CommitItemConfiguration;
  constructor(
    public payload: {
      handlerType: HandlerType;
      item: { id: string } & Partial<Item>;
      newSubflowSchema?: Resource;
    }
  ) {}
}

export class CancelItemConfiguration implements BaseStreamAction {
  readonly type = ActionType.CancelItemConfiguration;
}

export class UpdateMetadata implements BaseStreamAction {
  readonly type = ActionType.UpdateMetadata;
  constructor(public payload: StreamParams) {}
}

export class RunFromStart implements BaseStreamAction {
  readonly type = ActionType.RunFromStart;
}

export class RunFromTask implements BaseStreamAction {
  readonly type = ActionType.RunFromTask;
}

export class NewExecutionRegistered implements BaseStreamAction {
  readonly type = ActionType.NewExecutionRegistered;
}

export class NewRunFromStartProcess implements BaseStreamAction {
  readonly type = ActionType.NewProcessRanFromStart;
  constructor(public payload: { processId: string; instanceId: string }) {}
}

export class ExecutionStateUpdated implements BaseStreamAction {
  readonly type = ActionType.ExecutionUpdated;
  constructor(
    public payload: {
      changes: {
        mainGraphNodes?: Dictionary<GraphNode>;
        errorGraphNodes?: Dictionary<GraphNode>;
      };
    }
  ) {}
}

export class ExecutionStepsUpdated implements BaseStreamAction {
  readonly type = ActionType.ExecutionStepsUpdate;
  constructor(public payload: { steps: Dictionary<Dictionary<StepAttribute>> }) {}
}

export class ErrorPanelStatusChange implements BaseStreamAction {
  readonly type = ActionType.ErrorPanelStatusChange;
  constructor(public payload: { isOpen: boolean }) {}
}

export class DebugPanelStatusChange implements BaseStreamAction {
  readonly type = ActionType.DebugPanelStatusChange;
  constructor(public payload: { isOpen: boolean }) {}
}

export class FlowSaveSuccess implements BaseStreamAction {
  readonly type = ActionType.FlowSaveSuccess;
}

export class ActivityInstalled implements BaseStreamAction {
  readonly type = ActionType.ActivityInstalled;
  constructor(public payload: ActivitySchema) {}
}

export class CancelCreateItem implements BaseStreamAction {
  readonly type = ActionType.CancelCreateItem;
  constructor(public payload: { parentId: string }) {}
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
  | UpdateMetadata
  | CommitItemConfiguration
  | CancelItemConfiguration
  | NewExecutionRegistered
  | NewRunFromStartProcess
  | RunFromStart
  | RunFromTask
  | ExecutionStepsUpdated
  | ExecutionStateUpdated
  | ErrorPanelStatusChange
  | DebugPanelStatusChange
  | ActivityInstalled
  | CancelCreateItem;
