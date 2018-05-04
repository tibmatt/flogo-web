import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TriggerStatus} from '../configurator.component';

@Component({
  selector: 'flogo-triggers-configure-trigger',
  templateUrl: 'trigger.component.html',
  styleUrls: ['trigger.component.less']
})
export class ConfigureTriggerComponent {
  @Input()
  selectedTrigger: string;
  @Input()
  triggerData: TriggerStatus;
  @Output()
  triggerSelected: EventEmitter<string> = new EventEmitter<string>();

  onTriggerSelect() {
    this.triggerSelected.emit(this.triggerData.trigger.id);
  }
}
