import { FlowMetadata } from '@flogo-web/lib-client/core';
import { RenderableTrigger } from './renderable-trigger';

export interface TriggersState {
  appId: string;
  actionId: string;
  triggers: RenderableTrigger[];
  flowMetadata: FlowMetadata;
  currentTrigger: null | RenderableTrigger;
}
