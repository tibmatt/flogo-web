import { ImportsRefAgent, ValidationRuleFactory } from '@flogo-web/server/core';
import { validatorFactory as commonValidatorFactory } from '../../../../common/validator';

/**
 * @param schema
 * @param contributionRefs
 * @param options
 * @param importsRefAgent
 * @return {Validator}
 */
export function validatorFactory(
  schema,
  contributionRefs: string[],
  options = {},
  importsRefAgent: ImportsRefAgent
) {
  const validator = commonValidatorFactory(schema, options);
  validator.addValidationRule('trigger-installed', {
    errors: true,
    validate: ValidationRuleFactory.contributionInstalled(
      'trigger-installed',
      'Trigger',
      contributionRefs || [],
      importsRefAgent
    ),
  });
  return validator;
}
