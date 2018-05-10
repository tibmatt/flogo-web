import { mockActivityTask } from '../test/mock-task';
import { requiredPropertyValidator } from './required-property.validator';

describe('validation.attribute-validators.requiredPropertyValidator', function () {
  const validateRequiredProperty = requiredPropertyValidator('foo');

  it('should error if the required property is not found', function () {
    const task = mockActivityTask({
      input: {
        bar: 123
      }
    });
    expect(validateRequiredProperty(task)).toEqual({ required: true });
  });

  it('should not error if the property is provided', function () {
    const task = mockActivityTask({
      input: {
        foo: 'abcd',
        bar: 123
      }
    });
    expect(validateRequiredProperty(task)).toBeNull();
  });

});
