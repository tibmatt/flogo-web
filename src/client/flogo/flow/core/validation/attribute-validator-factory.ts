import { isEmpty } from 'lodash';
import { SchemaAttribute } from '@flogo/core';
import { validatorResolvers } from './attribute-validators/validator-resolvers';
import { composeValidators } from './compose-validators';
import { schemaAttributeToValidators } from './schema-attribute-to-validators';
import { ItemValidatorFn } from './interfaces';

export function attributeValidatorFactory(attribute: SchemaAttribute): null | ItemValidatorFn {
  const validators = schemaAttributeToValidators(validatorResolvers, attribute);
  return !isEmpty(validators) ? composeValidators(validators) : null;
}
