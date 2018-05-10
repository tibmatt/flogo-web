import { ActivitySchema } from '@flogo/core';
import { AttributeValidatorFactoryFn, Validator } from './interfaces';

export function itemValidatorsFactory(inputValidatorFactory: AttributeValidatorFactoryFn, schema: ActivitySchema): Validator[] {
  const inputs = schema.inputs || [];
  return inputs
    .map(attribute => {
      const validate = inputValidatorFactory(attribute);
      return {
        propertyName: attribute.name,
        validate,
      };
    })
    .filter(v => !!v.validate);
}

