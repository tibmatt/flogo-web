import {App as BackendApp, FLOGO_PROFILE_TYPE} from '@flogo/core';
import { TriggerGroup } from './trigger-group.interface';
import { FlowGroup } from './flow-group.interface';

export interface App extends BackendApp {
  profileType: FLOGO_PROFILE_TYPE;
  flowGroups: FlowGroup[];
  triggerGroups: TriggerGroup[];
}
