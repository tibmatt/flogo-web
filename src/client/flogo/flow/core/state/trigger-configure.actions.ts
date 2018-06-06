import {Action} from '@ngrx/store';
import {Dictionary, TriggerSchema} from '@flogo/core';

export enum TriggerConfigureActionType {
  OpenConfigureWithSelection = '[Flow] [Trigger] [Configure] Open Configure with trigger selected',
  CloseConfigure = '[Flow] [Trigger] [Configure] Close Configure',
  SelectTrigger = '[Flow] [Trigger] [Configure] Select Trigger'
}

export class OpenConfigureWithSelection implements Action {
  readonly type = TriggerConfigureActionType.OpenConfigureWithSelection;
  constructor(public payload: { triggerId: string, triggerSchemas: Dictionary<TriggerSchema> }) {}
}

export class CloseConfigure implements Action {
  readonly type = TriggerConfigureActionType.CloseConfigure;
}

export class SelectTrigger implements Action {
  readonly type = TriggerConfigureActionType.SelectTrigger;
  constructor(public payload: string) {}
}

export type TriggerConfigureActionUnion = OpenConfigureWithSelection
  | CloseConfigure
  | SelectTrigger;
