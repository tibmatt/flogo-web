import {isEqual} from 'lodash';
import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { distinctUntilChanged } from 'rxjs/operators';
import {TriggerInformation} from '../../interfaces';
import { ValueType } from '@flogo/core/constants';
import { SettingValue } from '@flogo/flow/triggers/configurator/trigger-detail/settings-value';
import { parseValue } from '@flogo/flow/triggers/configurator/trigger-detail/settings/parse-value';

const COMMON_FIELDS_TO_ENABLE = ['name', 'description', 'triggerSettings'];

@Component({
  selector: 'flogo-triggers-configuration-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['./shared/form-common-styles.less', 'settings.component.less']
})
export class ConfigureSettingsComponent implements OnChanges, OnDestroy {
  @Input()
  settingsForm: FormGroup;
  @Input()
  triggerInformation: TriggerInformation;
  @Output()
  statusChanges = new EventEmitter();
  triggerSettings: string[] | null;
  handlerSettings: string[] | null;

  VALUE_TYPES = ValueType;

  private previousState;
  private valueChangeSub: Subscription;

  ngOnChanges() {
    this.triggerSettings = this.settingsForm.controls.triggerSettings ?
      Object.keys((<FormGroup>this.settingsForm.controls.triggerSettings).controls)
      : null;
    this.handlerSettings = this.settingsForm.controls.handlerSettings ?
      Object.keys((<FormGroup>this.settingsForm.controls.handlerSettings).controls)
      : null;
    this.unsubscribePrevious();
    this.previousState = null;
    this.valueChangeSub = this.settingsForm.valueChanges
      .pipe(
        distinctUntilChanged(),
      )
      .subscribe(() => {
        const settingsStatus = this.settingsFormStatus;
        if (!isEqual(this.previousState, settingsStatus)) {
          this.previousState = settingsStatus;
          this.statusChanges.emit(settingsStatus);
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribePrevious();
  }

  editorOut(valueType: ValueType): (value: string) => SettingValue {
    return (value: string) => parseValue(valueType, value);
  }

  editorIn(value: SettingValue) {
    if (value != null) {
      return value.viewValue;
    }
    return '';
  }

  private unsubscribePrevious() {
    if (this.valueChangeSub && !this.valueChangeSub.closed) {
      this.valueChangeSub.unsubscribe();
      this.valueChangeSub = null;
    }
  }

  get settingsFormStatus() {
    return {
      isValid: this.settingsForm.valid,
      isDirty: this.settingsForm.dirty
    };
  }
}
