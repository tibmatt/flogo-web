import { ValueType } from '../../constants';

export type ContribSchema = ActivitySchema | TriggerSchema | FunctionSchema;

export interface ActivitySchema extends BaseSchema {
  type: 'flogo:activity';
  return: boolean;
  /** @deprecated */
  reply?: boolean;
  inputs: SchemaAttribute[];
  settings?: SchemaAttribute[];
}

export interface TriggerSchema extends BaseSchema {
  type: 'flogo:trigger';
  reply?: SchemaAttribute[];
  settings?: SchemaAttribute[];
  handler?: {
    settings: SchemaAttribute[];
  };
}
export interface FunctionSchema extends BaseSchema {
  type: 'flogo:function';
  functions: any[];
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
  type: 'flogo:trigger' | 'flogo:activity' | 'flogo:function';
  ref: string;
  version: string;
  title: string;
  description: string;
  author?: string;
  homepage: string;
  outputs?: SchemaAttribute[];
}
