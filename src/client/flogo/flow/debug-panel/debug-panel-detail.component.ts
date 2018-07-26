import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'flogo-flow-debug-panel-detail',
  templateUrl: './debug-panel-detail.component.html',
  styleUrls: ['./debug-panel-detail.component.less']
})
export class DebugPanelDetailComponent {

  @Input() activity;
  @Input() fields: FormGroup;
  @Input() runDisabled: boolean;
  @Output() close = new EventEmitter();

  onClose() {
    this.close.emit();
  }

}
