import { ActivitySchema, SchemaAttribute, ValueType } from '@flogo/core';
import { itemValidatorsFactory } from './item-validators-factory';

describe('validation.itemValidatorsFactory', function() {
  const mockActivitySchema = (inputs?: ActivitySchema['inputs']): ActivitySchema => ({
    name: 'someactivity',
    type: 'flogo:activity',
    ref: 'some/test/ref',
    title: 'some activity',
    homepage: '',
    description: 'some description',
    version: 'v0.0.0',
    return: false,
    inputs,
  });

  it('should not fail on schema with no attributes', function () {
    const validators = itemValidatorsFactory((attribute: SchemaAttribute) => null, mockActivitySchema());
    expect(validators.length).toBe(0);
  });

  it('should filter out attributes with no corresponding validators', function () {
    const validators = itemValidatorsFactory(
      (attribute: SchemaAttribute) => {
        if (attribute.name === 'attrWithValidation') {
          return () => ({ 'testVal': 123 });
        }
        return null;
      },
      mockActivitySchema([
        {
          name: 'attrWithoutValidation',
          type: ValueType.Any,
        },
        {
          name: 'attrWithValidation',
          type: ValueType.Any,
        },
        {
          name: 'someOtherAttribute',
          type: ValueType.Any,
        },
      ]),
    );
    expect(validators.length).toBe(1);
    const [validator] = validators;
    expect(validator.propertyName).toBe('attrWithValidation');
    expect(validator.validate(<any>{})).toEqual({ testVal: 123 });
  });

});
