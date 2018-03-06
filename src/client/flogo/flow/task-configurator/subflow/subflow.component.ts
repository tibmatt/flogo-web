import {Component, EventEmitter, Input, Output} from '@angular/core';


@Component({
  selector: 'flogo-flow-task-configurator-subflow',
  templateUrl: 'subflow.component.html',
  styleUrls: ['subflow.component.less'],
})

export class SubFlowComponent {
  @Input() subFlow;
  @Output()
  selectDifferentFlow: EventEmitter<string> = new EventEmitter<string>();

  selectFlow() {
    this.selectDifferentFlow.emit();
  }

}

