import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { FieldsInfo } from '../fields-info';
import {DebugActivityTask} from '../debug-activity-task';

@Component({
  selector: 'flogo-flow-debug-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelContentComponent implements OnChanges {

  @Input() activity: DebugActivityTask;
  @Input() fields: FieldsInfo;
  @Input() executionErrors?: Array<string>;
  @Input() canRestart: boolean;
  @Input() runDisabled: boolean;
  @Input() isEndOfFlow: boolean;
  @Input() activityHasRun: boolean;
  @Input() flowHasRun: boolean;
  @Output() runFromHere = new EventEmitter<DebugActivityTask>();

  viewState = 'empty';

  onRun() {
    this.runFromHere.emit(this.activity);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.computeViewState();
  }

  private computeViewState() {
    if (!this.flowHasRun) {
      this.viewState = 'noFlowRun';
    } if (this.activity) {
      this.viewState = 'activity';
    } else {
      this.viewState = 'empty';
    }
  }

}
