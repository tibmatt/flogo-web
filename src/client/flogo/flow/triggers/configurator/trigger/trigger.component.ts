import { Component, EventEmitter, HostBinding, HostListener, Input, Output, state } from '@angular/core';
import { TriggerStatus } from '../configurator.component';

@Component({
  selector: 'flogo-triggers-configure-trigger',
  templateUrl: 'trigger.component.html',
  styleUrls: ['trigger.component.less'],
})
export class ConfigureTriggerComponent {
  @Input()
  selectedTrigger: string;
  @Input()
  triggerData: TriggerStatus;
  @Output()
  triggerSelected: EventEmitter<string> = new EventEmitter<string>();

  @HostBinding('class.is-selected')
  get isSelected() {
    if (!this.triggerData || !this.triggerData.trigger) {
      return false;
    }
    return this.selectedTrigger === this.triggerData.trigger.id;
  }

  @HostListener('click')
  onTriggerSelect() {
    this.triggerSelected.emit(this.triggerData.trigger.id);
  }
}
