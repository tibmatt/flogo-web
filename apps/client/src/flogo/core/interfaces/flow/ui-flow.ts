import { FlowGraph } from '@flogo-web/client/core';
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
  mainItems: Dictionary<Item>;
  errorItems: Dictionary<Item>;
  mainGraph: FlowGraph;
  errorGraph: FlowGraph;
  schemas: Dictionary<ContribSchema>;
}
