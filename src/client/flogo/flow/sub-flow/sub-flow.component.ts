import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Action } from '@flogo/core';
import { FlogoFlowService as FlowsService } from '@flogo/flow/core/flow.service';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

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
  flowSelected: EventEmitter<Action | string> = new EventEmitter<Action | string>();

  @ViewChild('listModal') modal: ModalComponent;
  flowsList: Action[];

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
    this.onModalCloseOrDismiss();
  }

  selectedFlow(flow: Action) {
    this.flowSelected.emit(flow);
  }
}
