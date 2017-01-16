import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { IFlogoApplicationFlowModel as FlowModel } from './../../../common/application.model';

@Component({
  selector: 'flogo-apps-flows',
  moduleId: module.id,
  templateUrl: 'flows.tpl.html',
  styleUrls: ['flows.component.css']
})
export class FlogoApplicationFlowsComponent {
  @Input()
  public flows: Array<FlowModel> = [];
  @Output()
  public flowSelected: EventEmitter<FlowModel> = new EventEmitter<FlowModel>();

  constructor(public translate: TranslateService) {
  }

  select(flow: FlowModel) {
    this.flowSelected.emit(flow);
  }

}
