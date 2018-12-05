import { SettingValue } from '../settings-value';
import { ErrorTypes } from './error-types';
import { isUndefined, isNull } from 'lodash';

export function requiredValidator(control: { value: SettingValue }) {
  const value = control.value as SettingValue;
  if (
    value == null ||
    isUndefined(value.viewValue) ||
    isNull(value.viewValue) ||
    value.viewValue.trim() === ''
  ) {
    return { [ErrorTypes.Required]: true };
  }
  return null;
}
