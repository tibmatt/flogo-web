import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { IFlogoApplicationFlowModel as FlowModel } from '../../core/application.model';

@Component({
  selector: 'flogo-apps-flows',
  // moduleId: module.id,
  templateUrl: 'flows.component.html',
  styleUrls: ['flows.component.less']
})
export class FlogoApplicationFlowsComponent implements OnChanges {
  @Input()
  public flows: Array<FlowModel> = [];
  @Output()
  public flowSelected: EventEmitter<FlowModel> = new EventEmitter<FlowModel>();
  @Output()
  public deleteFlow: EventEmitter<FlowModel> = new EventEmitter<FlowModel>();

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.flows = _.sortBy(this.flows, flow => flow.name.toLowerCase());
  }

  trackByFlowId(index: number, flow: FlowModel) {
    return flow ? flow.id : null;
  }

  onSelect(event: Event, removeBox: ElementRef, flow: FlowModel) {
    if (!(event.target === removeBox.nativeElement || removeBox.nativeElement.contains(event.target))) {
      this.flowSelected.emit(flow);
    }
  }

  onDeleteFlow(flow: FlowModel) {
    this.deleteFlow.emit(flow);
  }
}
