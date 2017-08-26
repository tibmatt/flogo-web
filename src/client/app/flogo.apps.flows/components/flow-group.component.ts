import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { IFlogoApplicationFlowModel as FlowModel, Trigger } from '../../../common/application.model';

@Component({
  selector: 'flogo-apps-flows-flow-group',
  // moduleId: module.id,
  templateUrl: 'flow-group.tpl.html',
  styleUrls: ['flow-group.component.less']
})
export class FlowGroupComponent implements OnChanges {
  @Input()
  public flows: Array<FlowModel> = [];
  @Input()
  public trigger: Trigger;
  @Output()
  public flowSelected: EventEmitter<FlowModel> = new EventEmitter<FlowModel>();
  @Output() public deleteFlow: EventEmitter<{
    triggerId: string, flow: FlowModel
  }> = new EventEmitter<{
    triggerId: string, flow: FlowModel
  }>();
  @Output()
  public addFlow: EventEmitter<Trigger> = new EventEmitter<Trigger>();

  constructor(public translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flows'] && changes['flows'].currentValue) {
      this.flows = _.sortBy(this.flows, flow => flow.name.toLowerCase());
    }
  }

  trackByFlowId(index: number, flow: FlowModel) {
    return flow ? flow.id : null;
  }

  onSelect(flow: FlowModel) {
    this.flowSelected.emit(flow);
  }

  onDeleteFlow(flow: FlowModel) {
    this.deleteFlow.emit({ triggerId: (this.trigger ? this.trigger.id : null), flow: flow });
  }

  onAddFlow() {
    this.addFlow.emit(this.trigger);
  }

}
