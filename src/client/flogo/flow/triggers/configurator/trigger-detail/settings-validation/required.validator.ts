import { AbstractControl } from '@angular/forms';
import { SettingValue } from '../settings-value';

export function requiredValidator(control: AbstractControl) {
  const value = control.value as SettingValue;
  return value == null || value.viewValue == null ? {'required': true} : null;
}
