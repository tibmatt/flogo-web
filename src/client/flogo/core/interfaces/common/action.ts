import { flow } from '../backend';
import {FlowMetadata} from '../flow/flow-metadata';

export interface ActionBase {
  id: string;
  name: string;
  description?: string;
  metadata?: FlowMetadata;
  createdAt: string;
}

export interface Action extends ActionBase {
  updatedAt: string;
  data: {
    flow: flow.Flow
  };
}
