import {Component, Input} from '@angular/core';


@Component({
  selector: 'flogo-flow-task-configurator-subflow',
  templateUrl: 'subflow.component.html',
  styleUrls: ['subflow.component.less'],
})

export class SubFlowComponent {
  @Input() subFlow;

}

