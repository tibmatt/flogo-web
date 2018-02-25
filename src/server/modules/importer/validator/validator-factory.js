import Ajv from 'ajv';
import { Validator } from './validator';

export function validatorFactory(schema, contributionRefs, options = {}) {
  const defaultOptions = { removeAdditional: true, useDefaults: true, allErrors: true, };
  const ajv = new Ajv({ ...defaultOptions, ...options });
  addContributionRule(ajv, 'trigger-installed', 'Trigger', contributionRefs.triggers);
  addContributionRule(ajv, 'activity-installed', 'Activity', contributionRefs.activities);
  return new Validator(schema, ajv);
}

function addContributionRule(ajvInstance, keyword, type, refs) {
  ajvInstance.addKeyword(
    keyword,
    contributionRuleFactory(keyword, type, refs || []),
  );
}

function contributionRuleFactory(keyword, type, refs) {
  return {
    errors: true,
    validate: function validator(schema, contribRef) {
      const isInstalled = refs.includes(contribRef);
      if (!isInstalled) {
        validator.errors = [{
          keyword,
          message: `${type} "${contribRef}" is not installed`,
          params: {
            ref: contribRef,
          },
        }];
      }
      return isInstalled;
    },
  };
}
