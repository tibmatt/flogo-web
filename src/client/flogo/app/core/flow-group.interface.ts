import { Trigger } from '@flogo/core/application.model';

export interface FlowGroup {
  trigger: Trigger | null;
  // todo: define interface
  flows: any[];
}
