import { Trigger, Action } from '@flogo-web/client/core';

export interface TriggerGroup {
  triggers: Trigger[] | null;
  // todo: define interface
  flow: Action;
}
