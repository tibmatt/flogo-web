import {Component, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'flogo-triggers-configuration-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.less']
})
export class ConfigureSettingsComponent implements OnChanges {
  @Input()
  settingsForm;
  triggerSettings;
  handlerSettings;

  ngOnChanges() {
    this.triggerSettings = Object.keys(this.settingsForm.controls.triggerSettings.controls);
    this.handlerSettings = Object.keys(this.settingsForm.controls.handlerSettings.controls);
  }
}
