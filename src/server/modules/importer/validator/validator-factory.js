import Ajv from 'ajv';
import { Validator } from './validator';

export function validatorFactory(schema, contributionRefs, options = {}) {
  const ajv = new Ajv(options);
  addContributionRule(ajv, 'trigger-installed', contributionRefs.triggers, 'Trigger');
  addContributionRule(ajv, 'activity-installed', contributionRefs.activities, 'Activity');
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
        // todo: data?
        validator.errors = [{ keyword, message: `${type} "${contribRef}" is not installed` }];
      }
      return isInstalled;
    },
  };
}
