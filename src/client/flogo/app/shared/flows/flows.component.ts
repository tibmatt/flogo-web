import { sortBy } from 'lodash';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { FlowSummary } from '@flogo/core';

@Component({
  selector: 'flogo-apps-flows',
  // moduleId: module.id,
  templateUrl: 'flows.component.html',
  styleUrls: ['flows.component.less']
})
export class FlogoApplicationFlowsComponent implements OnChanges {
  @Input()
  public flows: Array<FlowSummary> = [];
  @Output()
  public flowSelected: EventEmitter<FlowSummary> = new EventEmitter<FlowSummary>();
  @Output()
  public deleteFlow: EventEmitter<FlowSummary> = new EventEmitter<FlowSummary>();

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.flows = sortBy(this.flows, flow => flow.name.toLowerCase());
  }

  trackByFlowId(index: number, flow: FlowSummary) {
    return flow ? flow.id : null;
  }

  onSelect(event: Event, removeBox: ElementRef, flow: FlowSummary) {
    if (!(event.target === removeBox.nativeElement || removeBox.nativeElement.contains(event.target))) {
      this.flowSelected.emit(flow);
    }
  }

  onDeleteFlow(flow: FlowSummary) {
    this.deleteFlow.emit(flow);
  }
}
