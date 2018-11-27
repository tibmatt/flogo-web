import { Trigger } from '@flogo-web/client/core';

export interface FlowGroup {
  trigger: Trigger | null;
  // todo: define interface
  flows: any[];
}
