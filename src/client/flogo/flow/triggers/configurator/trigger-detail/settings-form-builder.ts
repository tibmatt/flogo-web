import {keyBy, isEmpty} from 'lodash';
import {Injectable} from '@angular/core';
import {Dictionary, SchemaAttribute, TriggerSchema} from '@flogo/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {SettingControlInfo, SettingControlGroup, SettingControlGroupType} from '../interfaces';

@Injectable()
export class SettingsFormBuilder {
  constructor(private ngFormBuilder: FormBuilder) {}

  build(settingsFields, schema: TriggerSchema, settingControls: Dictionary<SettingControlInfo>) {
    const triggerSettingsSchema = keyBy<SchemaAttribute>(schema.settings, 'name');
    const handlerSettingsSchema = keyBy<SchemaAttribute>(schema.handler.settings, 'name');
    const settingsFormGroup: Dictionary<FormControl | FormGroup> = {};
    settingsFormGroup.name = this.ngFormBuilder.control(settingsFields.name.value || '', Validators.required);
    settingsFormGroup.description = this.ngFormBuilder.control(settingsFields.description.value || '', Validators.required);
    if (!isEmpty(settingsFields.triggerSettings)) {
      const getValidatorFn = this.generateValidatorFnGetter(settingControls, SettingControlGroup.TRIGGER);
      settingsFormGroup.triggerSettings = this.formGroupBySettings(settingsFields.triggerSettings, triggerSettingsSchema, getValidatorFn);
    }
    if (!isEmpty(settingsFields.handlerSettings)) {
      const getValidatorFn = this.generateValidatorFnGetter(settingControls, SettingControlGroup.HANDLER);
      settingsFormGroup.handlerSettings = this.formGroupBySettings(settingsFields.handlerSettings, handlerSettingsSchema, getValidatorFn);
    }
    return this.ngFormBuilder.group(settingsFormGroup);
  }

  private formGroupBySettings(settings, schema: Dictionary<SchemaAttribute>, controls): FormGroup {
    return this.ngFormBuilder.group(Object.keys(settings).reduce((group, setting) => {
      group[setting] = this.ngFormBuilder.control(settings[setting].value || '', controls(setting));
      /*if (schema[setting].required) {
        group[setting] = this.ngFormBuilder.control(settings[setting].value || '', Validators.required);
      } else {
        group[setting] = this.ngFormBuilder.control(settings[setting].value || '');
      }*/
      return group;
    }, {}));
  }

  private generateValidatorFnGetter(controls: Dictionary<SettingControlInfo>, type: SettingControlGroupType) {
    return (settingName: string): ValidatorFn[] => {
      return controls[`${type}.${settingName}`].validations;
    };
  }
}
