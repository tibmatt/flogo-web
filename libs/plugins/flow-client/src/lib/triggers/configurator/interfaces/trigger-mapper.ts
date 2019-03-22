import { FlowMetadata } from '@flogo-web/lib-client/core';
import { Tabs } from '../../../shared/tabs/models/tabs.model';
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
