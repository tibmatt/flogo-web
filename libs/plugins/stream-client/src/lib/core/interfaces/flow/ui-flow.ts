import { App, ContributionSchema, Metadata } from '@flogo-web/core';
import { Dictionary, FlowGraph } from '@flogo-web/lib-client/core';
import { Item } from './items';

export interface UiFlow {
  id?: string;
  name?: string;
  description?: string;
  appId?: string;
  app: App;
  metadata?: Metadata;
  attributes?: any[];
  mainItems: Dictionary<Item>;
  errorItems: Dictionary<Item>;
  mainGraph: FlowGraph;
  errorGraph: FlowGraph;
  schemas: Dictionary<ContributionSchema>;
}
