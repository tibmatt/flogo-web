import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FlogoFlowService as FlowsService } from '@flogo-web/client/flow/core/flow.service';
import { BsModalComponent } from 'ng2-bs3-modal';
import {ActionBase} from '@flogo-web/client/core';

@Component({
  selector: 'flogo-flow-sub-flow',
  templateUrl: 'sub-flow.component.html',
  styleUrls: ['sub-flow.component.less']
})
export class SubFlowComponent implements AfterViewInit, OnInit {
  @Input()
  appId: string;
  @Input()
  currentFlow: string;
  @Output()
  flowSelected: EventEmitter<ActionBase | string> = new EventEmitter<ActionBase | string>();

  @ViewChild('listModal') modal: BsModalComponent;
  flowsList: ActionBase[];

  constructor(private flowService: FlowsService) {}

  ngOnInit() {
    this.flowService.listFlowsForApp(this.appId).then(flows => {
      this.flowsList = flows.filter(flow => flow.id !== this.currentFlow);
    });
  }

  ngAfterViewInit() {
    this.open();
  }

  open() {
    this.modal.open();
  }

  onModalCloseOrDismiss() {
    this.flowSelected.emit('dismiss');
  }

  closeModal() {
    this.modal.close();
  }

  selectedFlow(flow: ActionBase) {
    this.flowSelected.emit(flow);
  }
}
