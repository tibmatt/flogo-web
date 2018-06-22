import { fromPairs } from 'lodash';
import { FormGroup } from '@angular/forms';
import { SettingControlGroup } from '@flogo/flow/triggers/configurator/interfaces';

export function extractTriggerChanges(form: FormGroup) {
  if (!form || !form.dirty) {
    return null;
  }
  const triggerChanges = [];
  const nameControl = form.get('name');
  if (nameControl && nameControl.dirty) {
    triggerChanges.push(['name', nameControl.value]);
  }
  const descriptionControl = form.get('description');
  if (descriptionControl && descriptionControl.dirty) {
    triggerChanges.push(['description', descriptionControl.value]);
  }
  const settingsControl = form.get(SettingControlGroup.TRIGGER);
  if (settingsControl && settingsControl.dirty) {
    triggerChanges.push(['settings', settingsControl.value]);
  }
  return triggerChanges.length > 0 ? fromPairs(triggerChanges) : null;
}
