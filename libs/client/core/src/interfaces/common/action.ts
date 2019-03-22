import { flow } from '../backend';
import { FlowMetadata } from '../flow/flow-metadata';

export interface Action {
  id: string;
  name: string;
  description?: string;
  metadata?: FlowMetadata;
  createdAt: string;
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
