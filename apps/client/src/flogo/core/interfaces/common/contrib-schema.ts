import { ValueType } from '@flogo-web/client/core/constants';

export type ContribSchema = ActivitySchema | TriggerSchema;

export interface ActivitySchema extends BaseSchema {
  type: 'flogo:activity' | 'flogo:device:activity';
  return: boolean;
  /** @deprecated */
  reply?: boolean;
  inputs: SchemaAttribute[];
}

export interface TriggerSchema extends BaseSchema {
  type: 'flogo:trigger' | 'flogo:device:trigger';
  reply?: SchemaAttribute[];
  settings?: SchemaAttribute[];
  handler?: {
    settings: SchemaAttribute[];
  };
}

export interface SchemaAttribute {
  name: string;
  type: ValueType;
  required?: boolean;
  allowed?: any[];
  // default value
  value?: any;
  display?: SchemaDisplay;
}

interface SchemaDisplay {
  name: string;
  type: string;
  mapperOutputScope: string;
}

export interface BaseSchema {
  name: string;
  type:
    | 'flogo:trigger'
    | 'flogo:activity'
    | 'flogo:device:trigger'
    | 'flogo:device:activity';
  ref: string;
  version: string;
  title: string;
  description: string;
  author?: string;
  homepage: string;
  outputs?: SchemaAttribute[];
}
