import { ValueType } from '@flogo/core';
import { schemaAttributeToValidators } from './schema-attribute-to-validators';

describe('validation.schemaAttributeToValidators', function () {
  it('should filter out not applicable attribute validators', function () {
    const validators = schemaAttributeToValidators([
      (input) => null,
      (input) => () => ({testResult: true}),
    ], {
      name: 'testAttr',
      type: ValueType.Any,
    });
    expect(validators.length).toEqual(1);
    expect(validators[0](null)).toEqual({
      testResult: true,
    });
  });
});
