import { ActivitySchema } from '@flogo/core';
import { itemValidatorsFactory } from './item-validators-factory';
import { attributeValidatorFactory } from './attribute-validator-factory';

export { Validator } from './interfaces';

export function createItemValidators(schema: ActivitySchema) {
  return itemValidatorsFactory(attributeValidatorFactory, schema);
}
