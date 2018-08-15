import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemActivityTask } from '@flogo/core';
import { FieldsInfo } from './fields-info';

@Component({
  selector: 'flogo-flow-debug-panel-detail',
  templateUrl: './debug-panel-detail.component.html',
  styleUrls: ['./debug-panel-detail.component.less']
})
export class DebugPanelDetailComponent {

  @Input() activity: ItemActivityTask;
  @Input() fields: FieldsInfo;
  @Input() runDisabled: boolean;
  @Output() close = new EventEmitter();
  @Output() runFromHere = new EventEmitter<ItemActivityTask>();

  onClose() {
    this.close.emit();
  }

  onRun() {
    this.runFromHere.emit(this.activity);
  }

}
