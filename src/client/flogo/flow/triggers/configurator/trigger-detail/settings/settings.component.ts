import {isEqual} from 'lodash';
import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from '@angular/core';
import {Subscription} from 'rxjs/src/Subscription';

@Component({
  selector: 'flogo-triggers-configuration-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.less']
})
export class ConfigureSettingsComponent implements OnChanges, OnDestroy {
  @Input()
  settingsForm;
  @Output()
  statusChanges = new EventEmitter();
  triggerSettings: string[] | null;
  handlerSettings: string[] | null;
  previousState;
  valueChangeSub: Subscription;

  ngOnChanges() {
    this.triggerSettings = this.settingsForm.controls.triggerSettings ?
      Object.keys(this.settingsForm.controls.triggerSettings.controls)
      : null;
    this.handlerSettings = this.settingsForm.controls.handlerSettings ?
      Object.keys(this.settingsForm.controls.handlerSettings.controls)
      : null;
    this.valueChangeSub = this.settingsForm.valueChanges.debounceTime(300)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!isEqual(this.previousState, this.settingsFormStatus)) {
          this.previousState = this.settingsFormStatus;
          this.statusChanges.emit(this.settingsFormStatus);
        }
      });
  }

  ngOnDestroy() {
    this.valueChangeSub.unsubscribe();
  }

  get settingsFormStatus() {
    return {
      isValid: this.settingsForm.valid,
      isDirty: this.settingsForm.dirty
    };
  }
}
