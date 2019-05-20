import { Metadata } from '@flogo-web/core';
import { RenderableTrigger } from './renderable-trigger';

export interface TriggersState {
  appId: string;
  actionId: string;
  triggers: RenderableTrigger[];
  flowMetadata: Metadata;
  currentTrigger: null | RenderableTrigger;
}
