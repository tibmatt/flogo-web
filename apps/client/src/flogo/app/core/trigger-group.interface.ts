import { Trigger, Action } from '@flogo/core';

export interface TriggerGroup {
  triggers: Trigger[] | null;
  // todo: define interface
  flow: Action;
}
