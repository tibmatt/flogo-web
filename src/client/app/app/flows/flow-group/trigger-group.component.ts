import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import { IFlogoApplicationFlowModel as FlowModel, Trigger } from '../../../core/application.model';

@Component({
  selector: 'flogo-apps-flows-trigger-group',
  // moduleId: module.id,
  templateUrl: 'trigger-group.component.html',
  styleUrls: ['../../../flogo.apps.flows/common/assets/group.component.less', 'trigger-group.component.less']
})
export class FlowTriggerGroupComponent implements OnChanges {
  @Input()
  public flow: FlowModel;
  @Input()
  public triggers: Trigger[] | null;
  @Output()
  public flowSelected: EventEmitter<FlowModel> = new EventEmitter<FlowModel>();
  @Output() public deleteFlow: EventEmitter<{
    triggerId: string, flow: FlowModel
  }> = new EventEmitter<{
    triggerId: string, flow: FlowModel
  }>();

  flows: FlowModel[] = [];
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

  trackByFlowId(index: number, flow: FlowModel) {
    return flow ? flow.id : null;
  }

  onSelect(flow: FlowModel) {
    this.flowSelected.emit(flow);
  }

  onDeleteFlow(flow: FlowModel) {
    this.deleteFlow.emit({ triggerId: null, flow: flow });
  }
}
