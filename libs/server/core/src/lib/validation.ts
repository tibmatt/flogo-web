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
};

function contributionRuleFactory(keyword, type, refs, importsRefAgent): ValidateFn {
  return function validator(schema, ref) {
    let contribRef;
    let isTypeInImports = false;
    if (ref.startsWith('#')) {
      ref = ref.substr(1);
      contribRef = importsRefAgent.getRef(ref);
      isTypeInImports = Array.from(importsRefAgent.imports.keys()).includes(ref);
    } else {
      isTypeInImports = true;
      contribRef = ref;
    }
    const isInstalled = refs.includes(contribRef);
    (validator as any).errors = [];
    if (!isTypeInImports) {
      (validator as any).errors.push([
        {
          keyword,
          message: `${type} "${contribRef}" is not installed among the imports`,
          params: {
            ref: contribRef,
          },
        },
      ]);
    }
    if (!isInstalled) {
      (validator as any).errors.push([
        {
          keyword,
          message: `${type} "${contribRef}" is not installed`,
          params: {
            ref: contribRef,
          },
        },
      ]);
    }
    return isTypeInImports && isInstalled;
  };
}
