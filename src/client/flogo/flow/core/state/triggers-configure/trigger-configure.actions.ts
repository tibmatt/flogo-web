import {Action} from '@ngrx/store';
import {Dictionary, TriggerSchema} from '@flogo/core';
import { TriggerConfigureTabType } from '../../interfaces';

export enum TriggerConfigureActionType {
  OpenConfigureWithSelection = '[Flow] [Trigger] [Configure] Open Configure with trigger selected',
  CloseConfigure = '[Flow] [Trigger] [Configure] Close Configure',
  SelectTrigger = '[Flow] [Trigger] [Configure] Select Trigger',
  SelectTab = '[Flow] [Trigger] [Configure] Select Trigger Tab',
  MapperStatusChanged = '[Flow] [Trigger] [Configure] Mapper update',
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

export class SelectTab implements Action {
  readonly type = TriggerConfigureActionType.SelectTab;
  constructor(public payload: TriggerConfigureTabType) {}
}

export class MapperStatusChanged implements Action {
  readonly type = TriggerConfigureActionType.MapperStatusChanged;
  constructor(public payload: {
    triggerId: string,
    groupType: TriggerConfigureTabType,
    newStatus: { isValid: boolean, isDirty: boolean },
  }) {}
}

export type TriggerConfigureActionUnion = OpenConfigureWithSelection
  | CloseConfigure
  | SelectTrigger
  | SelectTab
  | MapperStatusChanged;
