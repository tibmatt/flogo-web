import {FlowMetadata} from '@flogo-web/client/core/interfaces/flow';
import {HandlerMappings} from './configurator';
import {Tabs} from '../../../shared/tabs/models/tabs.model';

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
