import { Dictionary } from '../common';
import { App } from './app';
import { NodeDictionary } from '../flow-diagram';
import { TaskDictionary } from './task-dictionary';
import { FlowMetadata } from './flow-metadata';

export interface Handler {
  paths: {
    root: {
      is: string
    };
    nodes: NodeDictionary,
  };
  items: TaskDictionary;
}

export interface UiFlow extends Handler {
  id?: string;
  name?: string;
  description?: string;
  appId?: string;
  app: App;
  metadata?: FlowMetadata;
  attributes?: any[];
  items: TaskDictionary;
  errorHandler?: Handler;
  //// { [ref]: ContribSchema
  schemas: Dictionary<any>;
}
