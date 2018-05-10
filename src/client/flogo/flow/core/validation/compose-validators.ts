import { isEmpty } from 'lodash';
import { ItemTask } from '@flogo/core';
import { ErrorMap, ItemValidatorFn } from '@flogo/flow/core/validation/interfaces';

export function composeValidators(validatorFunctions: ItemValidatorFn[]): ItemValidatorFn {
  return (item: ItemTask) => {
    const errors = validatorFunctions.reduce(executeAndMergeErrors(item), {});
    const hasErrors = !isEmpty(errors);
    return hasErrors ? errors : null;
  };
}

function executeAndMergeErrors(item: ItemTask) {
  return (allErrors: ErrorMap, validator: ItemValidatorFn) => {
    const validationResult = validator(item);
    if (validationResult) {
      return {...allErrors, ...validationResult};
    }
    return allErrors;
  };
}
