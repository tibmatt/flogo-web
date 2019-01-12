import { isBoolean, isString, isUndefined, toNumber } from 'lodash';
import { ValueType } from '@flogo-web/client-core';
import { parseResolver } from '@flogo-web/parser';
import { SettingValue } from '../settings-value';

export function parseValue(type: ValueType, viewValue: string): SettingValue {
  const isExpression = isString(viewValue) && viewValue.startsWith('$');
  if (isExpression) {
    return {
      viewValue,
      parsedValue: viewValue,
      parsingDetails: parseResolver(viewValue),
    };
  } else {
    return {
      viewValue,
      parsedValue: coerce(type, viewValue),
    };
  }
}

function coerce(type: ValueType, inputValue: string) {
  switch (type) {
    case ValueType.Double:
    case ValueType.Integer:
    case ValueType.Long:
      return toNumber(inputValue);
    case ValueType.Boolean:
      return coerceToBoolean(inputValue);
    case ValueType.ComplexObject:
    case ValueType.Array:
    case ValueType.Object:
    case ValueType.Params:
      return coerceToJsonOrUndefined(inputValue);
    case ValueType.Any:
      return attemptAnyCoercion(inputValue);
  }
  return inputValue;
}

function attemptAnyCoercion(value: string) {
  const asNumber = parseFloat(value);
  if (!isNaN(asNumber)) {
    return asNumber;
  }
  const asBoolean = coerceToBoolean(value);
  if (isBoolean(asBoolean)) {
    return asBoolean;
  }
  const asJson = coerceToJsonOrUndefined(value);
  if (!isUndefined(asJson)) {
    return asJson;
  }
  return value;
}

function coerceToBoolean(inputValue: string) {
  if (inputValue === 'true') {
    return true;
  } else if (inputValue === 'false') {
    return false;
  } else {
    return undefined;
  }
}

function coerceToJsonOrUndefined(inputValue: string) {
  try {
    return JSON.parse(inputValue);
  } catch (e) {
    return undefined;
  }
}
