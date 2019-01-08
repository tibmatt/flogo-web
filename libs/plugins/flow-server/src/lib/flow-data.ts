import { Resource } from '@flogo-web/server/core';

export interface FlowData extends Resource {
  tasks: any[];
  // for test purposes
  // todo: remove
  internalInfo: string;
}
