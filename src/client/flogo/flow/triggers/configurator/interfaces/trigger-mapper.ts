import {FlowMetadata} from '@flogo/core/interfaces/flow';
import {HandlerMappings} from './configurator';

export interface MapperStatus {
  flowMetadata: FlowMetadata;
  triggerSchema: any;
  handler: any;
  changedMappings?: HandlerMappings;
}

export interface TriggerChanges {
  isValid: boolean;
  changedMappings?: HandlerMappings;
}
