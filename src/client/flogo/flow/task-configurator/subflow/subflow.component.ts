import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ActionBase} from '@flogo/core';


@Component({
  selector: 'flogo-flow-task-configurator-subflow',
  templateUrl: 'subflow.component.html',
  styleUrls: ['subflow.component.less'],
})

export class SubFlowComponent {
  @Input() subFlow;
  @Input() subflowList;
  @Output()
  flowSelected: EventEmitter<ActionBase> = new EventEmitter<ActionBase>();
  @Output()
  selectDifferentFlow: EventEmitter<string> = new EventEmitter<string>();
  showSubflowList = false;


  selectFlow() {
    this.showSubflowList = true;
    this.selectDifferentFlow.emit();
  }

  subFlowChanged(flow: any) {
    if (flow !== 'cancel') {
      this.flowSelected.emit(flow);
    }
    this.showSubflowList = false;
  }

}

