import { Resource } from '@flogo-web/core';
import { FlowSummary } from './flow-summary';
import { Trigger } from './trigger';

export interface App {
  id: string;
  name: string;
  version: string;
  description: string;
  createdAt: any;
  updatedAt: any;
  flows?: FlowSummary[];
  triggers?: Trigger[];
  actions?: Array<Resource>;
  resources?: Resource[];
  type?: string;
}
