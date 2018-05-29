import { FLOGO_PROFILE_TYPE, FlowMetadata } from '../../../core/index';
import { RenderableTrigger } from './renderable-trigger';

export interface TriggersState {
  appId: string;
  appProfileType: FLOGO_PROFILE_TYPE;
  actionId: string;
  triggers: RenderableTrigger[];
  flowMetadata: FlowMetadata;
  currentTrigger: null | RenderableTrigger;
}
