import {isEqual} from 'lodash';
import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {TriggerInformation} from '../../interfaces';
import { ValueType } from '@flogo/core/constants';

const COMMON_FIELDS_TO_DISABLE = ['name', 'description', 'triggerSettings'];

@Component({
  selector: 'flogo-triggers-configuration-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.less']
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
    if (this.triggerInformation.trigger.handlersCount > 1) {
      COMMON_FIELDS_TO_DISABLE.forEach(prop => {
        const propInSettingsForm = this.settingsForm.get(prop);
        if (propInSettingsForm) {
          propInSettingsForm.disable();
        }
      });
    }
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
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        if (!isEqual(this.previousState, this.settingsFormStatus)) {
          this.previousState = this.settingsFormStatus;
          this.statusChanges.emit(this.settingsFormStatus);
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribePrevious();
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
