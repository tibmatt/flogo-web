import { Action, Trigger } from '@flogo/core/application.model';

export interface TriggerGroup {
  triggers: Trigger[] | null;
  // todo: define interface
  flow: Action;
}
