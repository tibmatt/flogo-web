import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  HostBinding,
} from '@angular/core';
import { MapperController } from '../../shared/mapper';

@Component({
  selector: 'flogo-flow-task-configurator-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.less'],
})
export class SettingsComponent implements OnInit {
  @Input() mapperController: MapperController;

  ngOnInit() {
console.log(this.mapperController);
  }

}
