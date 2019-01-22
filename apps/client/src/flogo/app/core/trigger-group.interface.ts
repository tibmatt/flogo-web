import { Resource } from '@flogo-web/core';
import { Trigger } from '@flogo-web/client-core';

export interface TriggerGroup {
  triggers: Trigger[] | null;
  // todo: define interface
  flow: Resource;
}
