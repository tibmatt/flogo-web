import { sortBy } from 'lodash';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  HostBinding,
} from '@angular/core';
import { FlowSummary } from '@flogo-web/client-core';
import { DeleteEvent } from '../shared/delete-event';
import { Trigger } from '@flogo-web/core';

@Component({
  selector: 'flogo-apps-flows-flow-group',
  templateUrl: 'flow-group.component.html',
  styleUrls: ['../shared/group.component.less', 'flow-group.component.less'],
})
export class FlowGroupComponent implements OnChanges {
  @Input() public flows: Array<FlowSummary> = [];
  @Input() public trigger: Trigger;
  @Output() public flowSelected: EventEmitter<FlowSummary> = new EventEmitter<
    FlowSummary
  >();
  @Output() public deleteFlow: EventEmitter<DeleteEvent> = new EventEmitter<
    DeleteEvent
  >();
  @Output() public addFlow: EventEmitter<Trigger> = new EventEmitter<Trigger>();
  @HostBinding('class.flogo-group') hostClass = true;

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
    this.deleteFlow.emit({
      triggerId: this.trigger ? this.trigger.id : null,
      flow: flow,
    });
  }

  onAddFlow() {
    this.addFlow.emit(this.trigger);
  }
}
