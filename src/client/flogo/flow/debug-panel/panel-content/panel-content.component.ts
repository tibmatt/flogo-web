import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { ItemActivityTask } from '@flogo/core';
import { FieldsInfo } from '../fields-info';

@Component({
  selector: 'flogo-flow-debug-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelContentComponent implements OnChanges {

  @Input() activity: ItemActivityTask;
  @Input() fields: FieldsInfo;
  @Input() runDisabled: boolean;
  @Input() isEndOfFlow: boolean;
  @Input() activityHasRun: boolean;
  @Input() flowHasRun: boolean;
  @Output() close = new EventEmitter();
  @Output() runFromHere = new EventEmitter<ItemActivityTask>();

  viewState = 'empty';

  onClose() {
    this.close.emit();
  }

  onRun() {
    this.runFromHere.emit(this.activity);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.computeViewState();
  }

  private computeViewState() {
    if (!this.flowHasRun) {
      this.viewState = 'noFlowRun';
    } else if (this.activity && !this.activityHasRun) {
      this.viewState = 'noActivityRun';
    } else if (this.activity) {
      this.viewState = 'activity';
    } else {
      this.viewState = 'empty';
    }
  }

}
