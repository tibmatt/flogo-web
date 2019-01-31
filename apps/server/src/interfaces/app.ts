import { Resource } from '@flogo-web/server/core';
import { EngineSchemas } from './engine-schemas';

export interface App {
  id: string;
  name: string;
  type: string;
  version?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  // todo: rename to resources
  actions?: Resource[];
  triggers?: any[];
  properties?: EngineSchemas.AppProperty[];
}
