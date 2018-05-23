import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import {TriggerStatus} from '../interfaces';

@Component({
  selector: 'flogo-triggers-configure-trigger',
  templateUrl: 'trigger.component.html',
  styleUrls: ['trigger.component.less'],
})
export class ConfigureTriggerComponent {
  @Input()
  selectedTriggerID: string;
  @Input()
  triggerData: TriggerStatus;
  @Output()
  selectTrigger: EventEmitter<string> = new EventEmitter<string>();

  @HostBinding('class.is-selected')
  get isSelected() {
    if (!this.triggerData || !this.selectedTriggerID) {
      return false;
    }
    return this.selectedTriggerID === this.triggerData.id;
  }

  @HostListener('click')
  onTriggerSelect() {
    this.selectTrigger.emit(this.triggerData.id);
  }
}
