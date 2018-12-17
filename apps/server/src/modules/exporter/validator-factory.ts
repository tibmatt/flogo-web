import { validatorFactory as commonValidatorFactory } from '../../common/validator';

export function validatorFactory(schema, options = {}) {
  return commonValidatorFactory(schema, { allErrors: false, ...options });
}
