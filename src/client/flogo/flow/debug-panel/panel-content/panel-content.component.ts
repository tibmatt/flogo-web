import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { ItemActivityTask } from '../../../core/index';
import { FieldsInfo } from '../fields-info';

@Component({
  selector: 'flogo-flow-debug-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelContentComponent {

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
