import { isUndefined } from 'lodash';
import { AbstractControl } from '@angular/forms';

export function getAllowedValueValidator(allowedValues: any[]) {
  return (control: AbstractControl) => {
    const userValue = control.value ? control.value.parsedValue : undefined;
    if (isUndefined(userValue) || userValue === '') {
      return null;
    }
    /* tslint:disable-next-line:triple-equals */
    const isAllowedValue = !allowedValues.find(val => val == userValue);
    return isAllowedValue ? {'notAllowed': {'allowedValues': allowedValues}} : null;
  };
}
