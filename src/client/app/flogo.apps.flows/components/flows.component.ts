import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import { FlogoModal } from '../../../common/services/modal.service';
import {IFlogoApplicationFlowModel as FlowModel} from './../../../common/application.model';

@Component({
  selector: 'flogo-apps-flows',
  moduleId: module.id,
  templateUrl: 'flows.tpl.html',
  styleUrls: ['flows.component.css']
})
export class FlogoApplicationFlowsComponent implements OnChanges{
  @Input()
  public flows: Array<FlowModel> = [];
  @Output()
  public flowSelected: EventEmitter<FlowModel> = new EventEmitter<FlowModel>();
  @Output()
  public deleteFlow: EventEmitter<FlowModel> = new EventEmitter<FlowModel>();

  constructor(public translate: TranslateService, public flogoModal: FlogoModal) {
  }

  ngOnChanges(changes:SimpleChanges){
    this.flows = _.sortBy(this.flows, flow => flow.name.toLowerCase());
  }

  trackByFlowId(index: number, flow: FlowModel) {
    return flow ? flow.id : null;
  }

  onSelect(flow: FlowModel) {
    this.flowSelected.emit(flow);
  }

  onDeleteFlow(event: Event, flow: FlowModel) {
    event.stopPropagation();
    let message = this.translate.instant('FLOWS:CONFIRM_DELETE', {flowName: flow.name});
    this.flogoModal.confirmDelete(message).then((res) => {
      if (res) {
        this.deleteFlow.emit(flow);
      }
    });
  }
}
