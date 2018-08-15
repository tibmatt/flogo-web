import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldsInfo } from './fields-info';

@Component({
  selector: 'flogo-flow-debug-panel-detail',
  templateUrl: './debug-panel-detail.component.html',
  styleUrls: ['./debug-panel-detail.component.less']
})
export class DebugPanelDetailComponent {

  @Input() activity;
  @Input() fields: FieldsInfo;
  @Input() runDisabled: boolean;
  @Output() close = new EventEmitter();

  onClose() {
    this.close.emit();
  }

}
