import {Component, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'flogo-triggers-configuration-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.less']
})
export class ConfigureSettingsComponent implements OnChanges {
  @Input()
  settingsForm;
  triggerSettings: string[] | null;
  handlerSettings: string[] | null;

  ngOnChanges() {
    this.triggerSettings = this.settingsForm.controls.triggerSettings ?
      Object.keys(this.settingsForm.controls.triggerSettings.controls)
      : null;
    this.handlerSettings = this.settingsForm.controls.handlerSettings ?
      Object.keys(this.settingsForm.controls.handlerSettings.controls)
      : null;
  }
}
