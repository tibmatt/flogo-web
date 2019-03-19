const Ajv = require('ajv');
import AjvNS from 'ajv';

import { ContributionType } from '@flogo-web/core';
import { ImportsRefAgent } from '@flogo-web/server/core';

import { toActualReference } from './resource';

export type ValidateFn = AjvNS.SchemaValidateFunction | AjvNS.ValidateFunction;

export interface CustomValidation {
  keyword: string;
  validate: ValidateFn;
}

export type RuleViolationError = AjvNS.ErrorObject;

export type ValidatorFn = (data) => null | RuleViolationError[];

export function validate(
  schema,
  data,
  options = {},
  customValidations?: CustomValidation[]
): null | RuleViolationError[] {
  return createValidator(schema, options, customValidations)(data);
}

export function createValidator(
  schema,
  options?,
  customValidations?: CustomValidation[]
): ValidatorFn {
  options = { useDefaults: true, allErrors: true, ...options };
  const ajv = new Ajv(options);
  if (customValidations) {
    customValidations.forEach(validator =>
      ajv.addKeyword(validator.keyword, {
        validate: validator.validate,
        errors: true,
      })
    );
  }
  return validatorRunner(ajv.compile(schema));
}

function validatorRunner(validateFn: AjvNS.ValidateFunction) {
  return data => {
    const isValid = validateFn(data);
    return isValid ? null : validateFn.errors;
  };
}

export const ValidationRuleFactory = {
  contributionInstalled: contributionRuleFactory,
};

function contributionRuleFactory(
  keyword,
  type,
  refs,
  {
    contribType,
    importsRefAgent,
  }: { contribType: ContributionType; importsRefAgent: ImportsRefAgent }
): ValidateFn {
  return function validator(schema, ref) {
    if (
      ref.startsWith('#') &&
      !importsRefAgent.getPackageRef(contribType, ref.substr(1))
    ) {
      (validator as any).errors = [
        {
          keyword: `${keyword}-missing-import`,
          message: `"${ref}" is not found among the "imports"`,
          params: {
            ref: ref,
          },
        },
      ];
      return false;
    } else {
      const refToValidateWith = toActualReference(ref, contribType, importsRefAgent);
      if (!refs.includes(refToValidateWith)) {
        (validator as any).errors = [
          {
            keyword,
            message: `"${ref}" is not installed in the engine`,
            params: {
              ref: ref,
            },
          },
        ];
        return false;
      }
    }
    return true;
  };
}
