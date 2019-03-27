import { Tabs } from '../../../shared/tabs/models/tabs.model';
import { FlowMetadata } from '../../../core/interfaces/flow';
import { HandlerMappings } from './configurator';

export interface MapperStatus {
  flowMetadata: FlowMetadata;
  triggerSchema: any;
  handler: any;
  tabs: Tabs;
  changedMappings?: HandlerMappings;
}

export interface TriggerChanges {
  isValid: boolean;
  changedMappings?: HandlerMappings;
}
