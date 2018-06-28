import { isBoolean, isPlainObject, isArray } from 'lodash';
import { ValueType } from '@flogo/core';
import { ValidationErrors } from '@angular/forms';
import { ErrorTypeMismatch, ErrorTypes } from './error-types';

export function getStrictTypeValidator(schemaType: ValueType): (value: any) => (ValidationErrors | null) | null {
  switch (schemaType) {
    case ValueType.Integer:
    case ValueType.Long:
    case ValueType.Double:
      return getNumberValidator(schemaType);
    case ValueType.Boolean:
      return booleanValidator;
    case ValueType.Object:
    case ValueType.ComplexObject:
    case ValueType.Params:
      return getObjectValidator(schemaType);
    case ValueType.Array:
      return arrayValidator;
  }
  return null;
}

function makeMismatchError(expectedType: ValueType): { [type: string]: ErrorTypeMismatch } {
  return {[ErrorTypes.TypeMismatch]: { expectedType }};
}

function getNumberValidator(expectedType: ValueType) {
  return value => isNaN(value) ? makeMismatchError(expectedType) : null;
}

function booleanValidator(value: any) {
  return isBoolean(value) ? makeMismatchError(ValueType.Boolean) : null;
}

function getObjectValidator(expectedType: ValueType) {
  return value => isPlainObject(value) ? makeMismatchError(expectedType) : null;
}

function arrayValidator(value: any) {
  return isArray(value) ? makeMismatchError(ValueType.Array) : null;
}
