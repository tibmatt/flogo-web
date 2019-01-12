import { mapValues, isNil, omitBy } from 'lodash';
import { FormGroup } from '@angular/forms';
import { SettingValue } from '../../trigger-detail/settings-value';

export function convertSettingsFormValues(formGroup: FormGroup) {
  let values = mapValues<SettingValue, 'parsedValue'>(formGroup.value, 'parsedValue');
  values = omitBy(values, val => isNil(val) || val === '');
  return values;
}
