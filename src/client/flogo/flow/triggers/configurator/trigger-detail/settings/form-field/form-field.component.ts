import {Component, EventEmitter, Input, Output} from '@angular/core';
import {parseValue} from '../parse-value';
import {ValueType} from '@flogo/core/constants';
import {SettingValue} from '../../settings-value';
import {SettingControlInfo} from '../../../interfaces';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'flogo-configuration-settings-field',
  templateUrl: 'form-field.component.html',
  styleUrls: ['../shared/form-common-styles.less']
})
export class SettingsFormFieldComponent {
  @Input()
  settingInformation: SettingControlInfo;
  @Input()
  settingControl: FormControl;
  @Output()
  enableSettings = new EventEmitter();

  VALUE_TYPES = ValueType;

  editorOut(valueType: ValueType): (value: string) => SettingValue {
    return (value: string) => parseValue(valueType, value);
  }

  editorIn(value: SettingValue) {
    if (value != null) {
      return value.viewValue;
    }
    return '';
  }

  enableField() {
    this.enableSettings.emit();
  }
}
