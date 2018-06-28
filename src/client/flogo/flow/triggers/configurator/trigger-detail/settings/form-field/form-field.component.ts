import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChange, ViewChild } from '@angular/core';
import {FormControl} from '@angular/forms';
import {ValueType} from '@flogo/core/constants';
import {SettingValue} from '../../settings-value';
import {SettingControlInfo} from '../../../interfaces';
import { ConfirmationResult, ConfirmationService } from '../../../confirmation';
import {parseValue} from '../parse-value';
import { ConfirmEditionComponent } from '../confirm-edition/confirm-edition.component';

@Component({
  selector: 'flogo-configuration-settings-field',
  templateUrl: 'form-field.component.html',
  styleUrls: ['../shared/form-common-styles.less']
})
export class SettingsFormFieldComponent implements OnChanges {
  @Input() settingInformation: SettingControlInfo;
  @Input() settingControl: FormControl;
  @Output() enableSettings = new EventEmitter<ElementRef>();
  @ViewChild('field') fieldRef: ElementRef;

  editorOut: (value: string) => SettingValue;

  VALUE_TYPES = ValueType;

  ngOnChanges({ settingInformation }: { settingInformation?: SimpleChange }) {
    if (settingInformation) {
      const type = this.settingInformation.type;
      this.editorOut = (value: string) => parseValue(type, value);
    }
  }

  editorIn(value: SettingValue) {
    if (value != null) {
      return value.viewValue;
    }
    return '';
  }

  enableField() {
    this.enableSettings.emit(this.fieldRef);
  }
}
