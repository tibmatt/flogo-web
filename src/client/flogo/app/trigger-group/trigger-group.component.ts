import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Trigger, FlowSummary } from '@flogo/core';

@Component({
  selector: 'flogo-apps-flows-trigger-group',
  // moduleId: module.id,
  templateUrl: 'trigger-group.component.html',
  styleUrls: ['../shared/group.component.less', 'trigger-group.component.less']
})
export class FlowTriggerGroupComponent implements OnChanges {
  @Input()
  public flow: FlowSummary;
  @Input()
  public triggers: Trigger[] | null;
  @Output()
  public flowSelected: EventEmitter<FlowSummary> = new EventEmitter<FlowSummary>();
  @Output() public deleteFlow: EventEmitter<{
    triggerId: string, flow: FlowSummary
  }> = new EventEmitter<{
    triggerId: string, flow: FlowSummary
  }>();

  flows: FlowSummary[] = [];
  triggerCountDisplay = null;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flow'] && changes['flow'].currentValue) {
      this.flows = [];
      this.flows.push(this.flow);
    }

    if (changes['triggers'] && changes['triggers'].currentValue && changes['triggers'].currentValue.length > 1) {
      this.triggerCountDisplay = '+' + (this.triggers.length - 1);
    } else {
      this.triggerCountDisplay = null;
    }
  }

  trackByFlowId(index: number, flow: FlowSummary) {
    return flow ? flow.id : null;
  }

  onSelect(flow: FlowSummary) {
    this.flowSelected.emit(flow);
  }

  onDeleteFlow(flow: FlowSummary) {
    this.deleteFlow.emit({ triggerId: null, flow: flow });
  }
}
