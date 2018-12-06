import { App as BackendApp } from '@flogo-web/client/core';
import { TriggerGroup } from './trigger-group.interface';
import { FlowGroup } from './flow-group.interface';

export interface App extends BackendApp {
  flowGroups: FlowGroup[];
  triggerGroups: TriggerGroup[];
}
