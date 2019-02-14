import { Metadata } from '@flogo-web/core';

export namespace EngineSchemas {
  export interface App {
    name: string;
    type: string;
    version: string;
    appModel?: string;
    description?: string;
    properties?: AppProperty[];
    // todo: add trigger schema
    triggers: any[];
    resources: Resource[];
  }

  export interface AppProperty {
    name: string;
    // TODO: use value type enum
    type: string;
    value: any;
  }

  export interface Resource {
    id: string;
    data: { name: string; description?: string; metadata?: Metadata } & object;
  }
}
