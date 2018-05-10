import { SchemaAttribute } from '@flogo/core';
import { ItemValidatorFn } from './interfaces';
import { AttributeValidatorFactoryFn } from './interfaces';

export function schemaAttributeToValidators(validatorFactories: AttributeValidatorFactoryFn[], input: SchemaAttribute) {
  const validators: ItemValidatorFn[] = [];
  validatorFactories.forEach((factory) => {
    const validator = factory(input);
    if (validator) {
      validators.push(validator);
    }
  });
  return validators;
}
