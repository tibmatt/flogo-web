import {isEmpty} from 'lodash';
import {Injectable} from '@angular/core';
import {Dictionary} from '@flogo/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {SettingControlInfo, SettingControlGroup, SettingControlGroupType} from '../interfaces';

@Injectable()
export class SettingsFormBuilder {
  constructor(private ngFormBuilder: FormBuilder) {}

  build(settingsFields, settingControls: Dictionary<SettingControlInfo>) {
    const settingsFormGroup: Dictionary<FormControl | FormGroup> = {};
    settingsFormGroup.name = this.ngFormBuilder.control(settingsFields.name.value || '', Validators.required);
    settingsFormGroup.description = this.ngFormBuilder.control(settingsFields.description.value || '', Validators.required);
    if (!isEmpty(settingsFields.triggerSettings)) {
      const getValidatorFn = this.generateGetValidatorFn(settingControls, SettingControlGroup.TRIGGER);
      settingsFormGroup.triggerSettings = this.formGroupBySettings(settingsFields.triggerSettings, getValidatorFn);
    }
    if (!isEmpty(settingsFields.handlerSettings)) {
      const getValidatorFn = this.generateGetValidatorFn(settingControls, SettingControlGroup.HANDLER);
      settingsFormGroup.handlerSettings = this.formGroupBySettings(settingsFields.handlerSettings, getValidatorFn);
    }
    return this.ngFormBuilder.group(settingsFormGroup);
  }

  private formGroupBySettings(settings, getValidators: (string) => ValidatorFn[]): FormGroup {
    return this.ngFormBuilder.group(Object.keys(settings).reduce((group, setting) => {
      group[setting] = this.ngFormBuilder.control(settings[setting].value || '', getValidators(setting));
      return group;
    }, {}));
  }

  private generateGetValidatorFn(controlInfoBySetting: Dictionary<SettingControlInfo>,
                                    type: SettingControlGroupType): (string) => ValidatorFn[] {
    return (settingName: string): ValidatorFn[] => {
      return controlInfoBySetting[`${type}.${settingName}`].validations;
    };
  }
}
