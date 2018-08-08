import { SchemaAttribute, ValueType } from '@flogo/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SettingValue } from '../settings-value';
import { requiredValidator } from './required.validator';
import { getAllowedValueValidator } from './allowed-value.validator';
import { getStrictTypeValidator } from './type.validator';
import { validateExpression } from './resolver.validator';
import { isResolverExpression } from './is-resolver-expression';

export * from './error-types';

export function createValidatorsForSchema(schema: SchemaAttribute) {
  const validators: ValidatorFn[] = [];
  addRequiredValidation(schema.required, validators);
  addIsAllowedValueValidation(schema.allowed, validators);
  addTypeOrResolverValidation(schema.type, validators);
  return validators;
}

export function addRequiredValidation(isRequired: boolean, validators: ValidatorFn[] = []) {
  if (isRequired) {
    validators.push(requiredValidator);
  }
}

export function addIsAllowedValueValidation(allowedValues: any[], validators: ValidatorFn[]) {
  if (allowedValues && allowedValues.length > 0) {
    const allowedValueValidator = getAllowedValueValidator(allowedValues);
    validators.push((control: AbstractControl) => !isResolverExpression(control.value.parsedValue) ? allowedValueValidator(control) : null);
  }
}

export function addTypeOrResolverValidation(valueType: ValueType, validators: ValidatorFn[]) {
  const typeValidator = getStrictTypeValidator(valueType);
  const validator = getComposedExpressionOrTypeValidator(typeValidator);
  validators.push((control: AbstractControl) => validator(control.value));
}

function getComposedExpressionOrTypeValidator(strictTypeValidator: (value: any) => (ValidationErrors | null) | null ) {
  strictTypeValidator = strictTypeValidator ? strictTypeValidator : () => null;
  return (settingValue: SettingValue) => {
    if (!settingValue) {
      return null;
    }
    if (!settingValue.viewValue) {
      return null;
    }
    return isResolverExpression(settingValue.parsedValue) ?
      validateExpression(settingValue)
      : strictTypeValidator(settingValue.parsedValue);
  };
}
