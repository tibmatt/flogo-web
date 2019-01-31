import { validatorFactory as commonValidatorFactory } from '../../../../common/validator';

/**
 * @param schema
 * @param contributionRefs
 * @param options
 * @return {Validator}
 */
export function validatorFactory(schema, contributionRefs, options = {}) {
  const validator = commonValidatorFactory(schema, options);
  addContributionRule(
    validator,
    'trigger-installed',
    'Trigger',
    contributionRefs.triggers
  );
  addContributionRule(
    validator,
    'activity-installed',
    'Activity',
    contributionRefs.activities
  );
  return validator;
}

/**
 *
 * @param {Validator} validator
 * @param keyword
 * @param type
 * @param refs
 */
function addContributionRule(validator, keyword, type, refs) {
  validator.addValidationRule(
    keyword,
    contributionRuleFactory(keyword, type, refs || [])
  );
}

function contributionRuleFactory(keyword, type, refs) {
  return {
    errors: true,
    validate: function validator(schema, contribRef) {
      const isInstalled = refs.includes(contribRef);
      if (!isInstalled) {
        (validator as any).errors = [
          {
            keyword,
            message: `${type} "${contribRef}" is not installed`,
            params: {
              ref: contribRef,
            },
          },
        ];
      }
      return isInstalled;
    },
  };
}
