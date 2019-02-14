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

export type ContributionSchema = ActivitySchema | FunctionsSchema;
