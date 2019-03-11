import { ValidationRuleFactory } from '@flogo-web/server/core';
import { validatorFactory as commonValidatorFactory } from '../../../../common/validator';

/**
 * @param schema
 * @param contributionRefs
 * @param options
 * @param importsTypeToRefAgent
 * @return {Validator}
 */
export function validatorFactory(schema, contributionRefs: string[], options = {}, importsTypeToRefAgent) {
  const validator = commonValidatorFactory(schema, options);
  validator.addValidationRule('trigger-installed', {
    errors: true,
    validate: ValidationRuleFactory.contributionInstalled(
      'trigger-installed',
      'Trigger',
      contributionRefs || []
    ),
  });
  validator.addValidationRule('type-installed', {
    errors: true,
    validate: ValidationRuleFactory.typeInstalled(
      'type-installed',
      'Trigger',
      contributionRefs || [],
      importsTypeToRefAgent
    ),
  });
  return validator;
}
