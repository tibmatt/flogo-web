import { Resource } from '@flogo-web/server/core';

export interface App {
  id: string;
  // todo: change to resources
  actions: Resource[];
}
