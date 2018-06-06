import { TriggerSchema } from '@flogo/core';
import { FormGroupState } from 'ngrx-forms';

export interface TriggerConfigureSettings {
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
  id: string;
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

export interface TriggerConfigureState {
  isOpen: boolean;
  selectedTriggerId: string;
  schemas: { [triggerRef: string]: TriggerSchema };
  triggersForm: FormGroupState<TriggerConfigureGroups>;
}
