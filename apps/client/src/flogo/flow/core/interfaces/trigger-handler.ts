import { flow } from '@flogo-web/client-core';

export interface TriggerHandler {
  actionId: string;
  triggerId?: string;
  settings: { [name: string]: any };
  outputs: { [name: string]: any };
  actionMappings?: {
    input: flow.Mapping[];
    output: flow.Mapping[];
  };
}
