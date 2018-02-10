import { flow } from '../backend';

export interface Action {
  id: string;
  name: string;
  description?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  data: {
    flow: flow.Flow
  };
}
