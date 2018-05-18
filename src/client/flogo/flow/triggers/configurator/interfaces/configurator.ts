import {FlowMetadata} from '@flogo/core/interfaces/flow';
import {Trigger} from '../../../core';

export interface TriggerConfiguration {
  handler: any;
  trigger: any;
  triggerSchema: any;
  isValid: boolean;
  isDirty: boolean;
  changedMappings?: HandlerMappings;
}

export interface HandlerMappings {
  actionMappings: { input: any[], output: any[] };
}

export interface TriggerDetail {
  handler: HandlerMappings;
  trigger: any;
  triggerSchema: any;
}

export interface ConfiguratorStatus {
  disableSave?: boolean;
  isOpen?: boolean;
  triggers?: TriggerStatus[];
  selectedTriggerID?: string;
}

export interface ModalStatus {
  isOpen: boolean;
  flowMetadata: FlowMetadata;
  selectedTriggerID: string;
}

export interface SaveData {
  trigger: Trigger;
  mappings: HandlerMappings;
}

export interface TriggerStatus {
  id?: string;
  isValid?: boolean;
  isDirty?: boolean;
  name?: string;
}
