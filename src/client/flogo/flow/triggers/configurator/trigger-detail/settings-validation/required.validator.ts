import { AbstractControl } from '@angular/forms';
import { SettingValue } from '../settings-value';
import { ErrorTypes } from './error-types';

export function requiredValidator(control: AbstractControl) {
  const value = control.value as SettingValue;
  return value == null || !value.viewValue ? {[ErrorTypes.Required]: true} : null;
}
