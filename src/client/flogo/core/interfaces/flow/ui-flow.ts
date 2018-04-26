import { FlowGraph } from '@flogo/core';
import { Dictionary, ContribSchema } from '../common';
import { App } from './app';
import { FlowMetadata } from './flow-metadata';
import { Item } from './items';

export interface UiFlow {
  id?: string;
  name?: string;
  description?: string;
  appId?: string;
  app: App;
  metadata?: FlowMetadata;
  attributes?: any[];
  items: Dictionary<Item>;
  errorItems: Dictionary<Item>;
  mainGraph: FlowGraph;
  errorGraph: FlowGraph;
  schemas: Dictionary<ContribSchema>;
}
