import { mapValues } from 'lodash';
import { FormGroup } from '@angular/forms';
import { SettingValue } from '../../trigger-detail/settings-value';

export function convertSettingsFormValues(formGroup: FormGroup) {
  return mapValues<SettingValue, 'parsedValue'>(formGroup.value, 'parsedValue');
}
