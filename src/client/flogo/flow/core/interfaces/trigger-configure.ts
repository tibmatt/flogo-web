import { TriggerSchema } from '@flogo/core';
import { FormGroupState } from 'ngrx-forms';

export interface TriggerConfigureSettings {
  groupId: 'settings';
  id: string;
  name: string;
  description: string;
  trigger: {
    [id: string]: any;
  };
  handler: {
    [id: string]: any;
  };
}

export interface TriggerConfigureMappings {
  groupId: 'flowInputMappings' | 'flowOutputMappings';
  mappings: { [field: string]: string };
}

export interface  TriggerConfigureGroup {
  id: string;
  settings?: TriggerConfigureSettings;
  inputMappings?: TriggerConfigureMappings;
  outputMappings?: TriggerConfigureMappings;
}

export interface TriggerConfigureGroups {
  [triggerId: string]: TriggerConfigureGroup;
}

export type TriggerConfigureTabName = 'settings' | 'flowInputMappings' | 'flowOutputMappings';
export interface TriggerConfigureState {
  isOpen: boolean;
  selectedTriggerId: string;
  currentTab: TriggerConfigureTabName;
  schemas: { [triggerRef: string]: TriggerSchema };
  triggersForm: FormGroupState<TriggerConfigureGroups>;
}
