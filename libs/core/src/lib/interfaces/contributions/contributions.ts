import { ContributionType } from '../../constants';
import {
  SchemaAttributeDescriptor,
  SchemaOutput,
  BaseContributionSchema,
} from './common';
import { FunctionsSchema } from './functions';

export interface ActivitySchema extends BaseContributionSchema {
  type: ContributionType.Activity;
  settings?: SchemaAttributeDescriptor[];
  input?: SchemaAttributeDescriptor[];
  output?: SchemaOutput[];
}

export interface TriggerSchema extends BaseContributionSchema {
  type: ContributionType.Trigger;
  reply?: SchemaAttributeDescriptor[];
  output?: SchemaAttributeDescriptor[];
  settings?: SchemaAttributeDescriptor[];
  handler?: {
    settings: SchemaAttributeDescriptor[];
  };
}

export type ContributionSchema = TriggerSchema | ActivitySchema | FunctionsSchema;
