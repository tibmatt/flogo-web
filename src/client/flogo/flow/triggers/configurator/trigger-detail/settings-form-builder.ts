import {keyBy} from 'lodash';
import {Injectable} from '@angular/core';
import {Dictionary, SchemaAttribute, TriggerSchema} from '@flogo/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Injectable()
export class SettingsFormBuilder {
  constructor(private ngFormBuilder: FormBuilder, ) {}

  build(settingsFields, schema: TriggerSchema) {
    const triggerSettingsSchema = keyBy<SchemaAttribute>(schema.settings, 'name');
    const handlerSettingsSchema = keyBy<SchemaAttribute>(schema.handler.settings, 'name');
    const settingsFormGroup: Dictionary<FormControl | FormGroup> = {};
    settingsFormGroup.name = this.ngFormBuilder.control(settingsFields.name.value || '', Validators.required);
    settingsFormGroup.description = this.ngFormBuilder.control(settingsFields.description.value || '', Validators.required);
    settingsFormGroup.triggerSettings = this.formGroupBySettings(settingsFields.triggerSettings, triggerSettingsSchema);
    settingsFormGroup.handlerSettings = this.formGroupBySettings(settingsFields.handlerSettings, handlerSettingsSchema);
    return this.ngFormBuilder.group(settingsFormGroup);
  }

  private formGroupBySettings(settings, schema: Dictionary<SchemaAttribute>): FormGroup {
    return this.ngFormBuilder.group(Object.keys(settings).reduce((group, setting) => {
      if (schema[setting].required) {
        group[setting] = this.ngFormBuilder.control(settings[setting].value || '', Validators.required);
      } else {
        group[setting] = this.ngFormBuilder.control(settings[setting].value || '');
      }
      return group;
    }, {}));
  }
}
