import {
  SchemaAttributeDescriptor,
  SchemaOutput,
  BaseContributionSchema,
} from './common';
import { FunctionsSchema } from './functions';

export interface ActivitySchema extends BaseContributionSchema {
  type: 'flogo:activity';
  settings?: SchemaAttributeDescriptor[];
  input?: SchemaAttributeDescriptor[];
  output?: SchemaOutput[];
}

export interface TriggerSchema extends BaseContributionSchema {
  type: 'flogo:trigger';
  reply?: SchemaAttributeDescriptor[];
  output?: SchemaAttributeDescriptor[];
  settings?: SchemaAttributeDescriptor[];
  handler?: {
    settings: SchemaAttributeDescriptor[];
  };
}

export type ContributionSchema = TriggerSchema | ActivitySchema | FunctionsSchema;
