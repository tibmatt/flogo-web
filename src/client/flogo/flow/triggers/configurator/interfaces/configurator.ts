import {FlowMetadata} from '@flogo/core/interfaces/flow';
import {Trigger} from '../../../core';

export interface TriggerStatus {
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

export interface ModalStatus {
  isOpen: boolean;
  triggers: TriggerDetail[];
  flowMetadata: FlowMetadata;
  selectedTrigger: string;
}

export interface SaveData {
  trigger: Trigger;
  mappings: HandlerMappings;
}

export interface ConfigurationStatus {
  triggerId: string;
  isValid: boolean;
  changedMappings: HandlerMappings;
}
