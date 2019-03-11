const Ajv = require('ajv');
import AjvNS from 'ajv';

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
  typeInstalled: contributionTypeRuleFactory
};

function contributionRuleFactory(keyword, type, refs): ValidateFn {
  return function validator(schema, contribRef) {
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
  };
}

function contributionTypeRuleFactory(keyword, type, refs, agent): ValidateFn {
  return function validator(schema, contribType) {
    const contribRef = agent.getRef(contribType);
    const isTypeInImports = Array.from(agent.imports.keys()).includes(contribType);
    const isInstalled = refs.includes(contribRef);
    const validationErrors = (validator as any).errors = [];
    if (!isTypeInImports) {
      validationErrors.push([
        {
          keyword,
          message: `${type} "${contribType}" is not installed among the imports`,
          params: {
            ref: contribType,
          },
        },
      ]);
    }
    if (!isInstalled) {
      validationErrors.push([
        {
          keyword,
          message: `${type} "${contribType}" mapped to "${contribRef}" is not installed`,
          params: {
            ref: contribRef,
          },
        },
      ]);
    }

    /*if (!isTypeInImports || !isInstalled) {
      (validator as any).errors = [
        {
          keyword,
          message: `${type} "${contribType}" is not installed among the imports`,
          params: {
            ref: contribType,
          },
        },
      ];
    }*/
    return !isInstalled || !isTypeInImports;
  };
}
