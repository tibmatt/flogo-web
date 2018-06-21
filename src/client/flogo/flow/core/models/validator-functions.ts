import {SchemaAttribute, ValueType} from '@flogo/core';
import {AbstractControl, ValidatorFn, Validators} from '@angular/forms';

export function createValidatorsForSchema(schema: SchemaAttribute) {
  const validators: ValidatorFn[] = [];
  addRequiredValidation(schema.required, validators);
  addAllowedInValidation(schema.allowed, validators);
  addStrictTypeValidation(schema.type, validators);
  return validators;
}

function addRequiredValidation(isRequired: boolean, validators: ValidatorFn[] = []) {
  if (isRequired) {
    validators.push(Validators.required);
  }
}

function addAllowedInValidation(allowedValues: any[], validators: ValidatorFn[]) {
  if (allowedValues && allowedValues.length > 0) {
    validators.push((control: AbstractControl) => {
      /* tslint:disable-next-line:triple-equals */
      const failedValidation = !allowedValues.find(val => val == control.value);
      return failedValidation ? {'notAllowed': {'allowedValues': allowedValues}} : null;
    });
  }
}

function addStrictTypeValidation(schemaType: ValueType, validators: ValidatorFn[]) {
  switch (schemaType) {
    case ValueType.Integer:
    case ValueType.Long:
    case ValueType.Double:
      validators.push((control: AbstractControl) => {
        return isNaN(Number(control.value)) ? {'typeMismatch': {'expectedType': schemaType}} : null;
      });
      break;
    case ValueType.Boolean:
      validators.push((control: AbstractControl) => {
        const valueToCheck = control.value.toString();
        const failedValidation = !(valueToCheck === 'true' || valueToCheck === 'false');
        return failedValidation ? {'typeMismatch': {'expectedType': schemaType}} : null;
      });
      break;
  }
}
