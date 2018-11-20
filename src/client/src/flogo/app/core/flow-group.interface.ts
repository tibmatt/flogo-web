import { Trigger } from '@flogo/core';

export interface FlowGroup {
  trigger: Trigger | null;
  // todo: define interface
  flows: any[];
}
