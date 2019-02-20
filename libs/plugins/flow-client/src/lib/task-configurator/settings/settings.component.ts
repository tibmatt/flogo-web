import { Component, Input } from '@angular/core';
import { MapperController } from '../../shared/mapper';

@Component({
  selector: 'flogo-flow-task-configurator-settings',
  templateUrl: 'settings.component.html',
})
export class SettingsComponent {
  @Input() mapperController: MapperController;
}
