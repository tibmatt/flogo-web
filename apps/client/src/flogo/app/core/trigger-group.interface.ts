import { Resource, Trigger } from '@flogo-web/core';

export interface TriggerGroup {
  triggers: Trigger[] | null;
  // todo: define interface
  flow: Resource;
}
