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
    const contribInstallationError = validateContribInstallation(refs, keyword);
    if (ref.startsWith('#')) {
      const normalizedRef = ref.substr(1);
      const fullPathRef = importsRefAgent.getRef(normalizedRef);
      if (!importsRefAgent.imports.get(normalizedRef)) {
        (validator as any).errors = [
          {
            keyword: `${keyword}-missing-import`,
            message: `"${ref}" is not installed among the imports`,
            params: {
              ref: ref,
            },
          },
        ];
        return false;
      } else {
        (validator as any).errors = contribInstallationError(fullPathRef, ref);
        if ((validator as any).errors.length) {
          return false;
        }
      }
    } else {
      (validator as any).errors = contribInstallationError(ref, ref);
      if ((validator as any).errors.length) {
        return false;
      }
    }
    return true;
  };
}

const validateContribInstallation = (installedRefs, keyword) => (fullPathRef, ref) => {
  let errors = [];
  if (!installedRefs.includes(fullPathRef)) {
    errors = [
      {
        keyword,
        message: `"${ref}" is not installed in the engine`,
        params: {
          ref: ref,
        },
      },
    ];
  }
  return errors;
};
