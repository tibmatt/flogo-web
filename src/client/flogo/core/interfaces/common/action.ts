import { flow } from '../backend';
import {FlowMetadata} from '@flogo/core';

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
