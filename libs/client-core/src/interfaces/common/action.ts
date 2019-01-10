import { flow } from '../backend';
import { FlowMetadata } from '../flow/flow-metadata';

export interface ActionBase {
  id: string;
  name: string;
  description?: string;
  metadata?: FlowMetadata;
  createdAt: string;
}

export interface Action extends ActionBase {
  appId?: string;
  triggers?: any[];
  updatedAt: string;
  tasks: flow.Task[];
  links: flow.Link[];
  errorHandler?: {
    tasks: flow.Task[];
    links: flow.Link[];
  };
  explicitReply?: boolean;
}
