import { ItemTask } from '@flogo/core';
import { ItemValidatorFn } from './interfaces';
import { composeValidators } from './compose-validators';
import { mockActivityTask } from '@flogo/flow/core/validation/test/mock-task';

describe('validation.composeValidators', function() {
  const taskMock = mockActivityTask({});

  it('should return the errors of the composed validators', function () {
    const validators: ItemValidatorFn[] = [
      (item: ItemTask) => null,
      (item: ItemTask) => ({
        someError: true
      }),
      (item: ItemTask) => ({
        someOtherError: {
          moreData: 'foobar'
        }
      }),
      (item: ItemTask) => null,
    ];
    expect(composeValidators(validators)(taskMock)).toEqual({
      someError: true,
      someOtherError: {
        moreData: 'foobar',
      },
    });
  });

  it('should return null if all validators pass', function () {
    const validators: ItemValidatorFn[] = [
      (item: ItemTask) => null,
      (item: ItemTask) => ({}),
      (item: ItemTask) => null,
    ];
    expect(composeValidators(validators)(taskMock)).toBeNull();
  });
});
