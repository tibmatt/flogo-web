import { ValidationRuleFactory } from '@flogo-web/server/core';
import { validatorFactory as commonValidatorFactory } from '../../../../common/validator';

/**
 * @param schema
 * @param contributionRefs
 * @param options
 * @return {Validator}
 */
export function validatorFactory(schema, contributionRefs: string[], options = {}) {
  const validator = commonValidatorFactory(schema, options);
  validator.addValidationRule('trigger-installed', {
    errors: true,
    validate: ValidationRuleFactory.contributionInstalled(
      'trigger-installed',
      'Trigger',
      contributionRefs || []
    ),
  });
  return validator;
}
