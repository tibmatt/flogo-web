import { sortBy } from 'lodash';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Trigger, FlowSummary } from '@flogo/core';

@Component({
  selector: 'flogo-apps-flows-flow-group',
  // moduleId: module.id,
  templateUrl: 'flow-group.component.html',
  styleUrls: ['../shared/group.component.less', 'flow-group.component.less']
})
export class FlowGroupComponent implements OnChanges {
  @Input()
  public flows: Array<FlowSummary> = [];
  @Input()
  public trigger: Trigger;
  @Output()
  public flowSelected: EventEmitter<FlowSummary> = new EventEmitter<FlowSummary>();
  @Output() public deleteFlow: EventEmitter<{
    triggerId: string, flow: FlowSummary
  }> = new EventEmitter<{
    triggerId: string, flow: FlowSummary
  }>();
  @Output()
  public addFlow: EventEmitter<Trigger> = new EventEmitter<Trigger>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flows'] && changes['flows'].currentValue) {
      this.flows = sortBy(this.flows, flow => flow.name.toLowerCase());
    }
  }

  trackByFlowId(index: number, flow: FlowSummary) {
    return flow ? flow.id : null;
  }

  onSelect(flow: FlowSummary) {
    this.flowSelected.emit(flow);
  }

  onDeleteFlow(flow: FlowSummary) {
    this.deleteFlow.emit({ triggerId: (this.trigger ? this.trigger.id : null), flow: flow });
  }

  onAddFlow() {
    this.addFlow.emit(this.trigger);
  }

}
