import {keyBy} from 'lodash';
import {Injectable} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Dictionary, SchemaAttribute, TriggerSchema} from '@flogo/core';

@Injectable()
export class ConfigureDetailsService {
  constructor(private ngFB: FormBuilder) {}

  generateSettingsForm(settingsFields, schema: TriggerSchema) {
    const triggerSettingsSchema = keyBy<SchemaAttribute>(schema.settings, 'name');
    const handlerSettingsSchema = keyBy<SchemaAttribute>(schema.handler.settings, 'name');
    const settingsFormGroup: Dictionary<FormControl | FormGroup> = {};
    settingsFormGroup.name = this.ngFB.control(settingsFields.name.value || '', Validators.required);
    settingsFormGroup.description = this.ngFB.control(settingsFields.description.value || '', Validators.required);
    settingsFormGroup.triggerSettings = this.formGroupBySettings(settingsFields.triggerSettings, triggerSettingsSchema);
    settingsFormGroup.handlerSettings = this.formGroupBySettings(settingsFields.handlerSettings, handlerSettingsSchema);
    return this.ngFB.group(settingsFormGroup);
  }

  private formGroupBySettings(settings, schema: Dictionary<SchemaAttribute>): FormGroup {
    return this.ngFB.group(Object.keys(settings).reduce((group, setting) => {
      if (schema[setting].required) {
        group[setting] = this.ngFB.control(settings[setting].value || '', Validators.required);
      } else {
        group[setting] = this.ngFB.control(settings[setting].value || '');
      }
      return group;
    }, {}));
  }
}
