import { Action } from '../common/action';
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
  triggers?: Array<Trigger>;
  actions?: Array<Action>;
  type?: string;
  device?: any;
}

