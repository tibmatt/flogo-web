import { SchemaAttribute } from '@flogo/core';
import { AttributeValidatorFactoryFn } from '../interfaces';
import { requiredPropertyValidator } from './required-property.validator';

// Determine which validators should be applied to a given schema attribute
export const validatorResolvers: AttributeValidatorFactoryFn[] = [
  (attribute: SchemaAttribute) => attribute.required ? requiredPropertyValidator(attribute.name) : null,
];
