import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { BsModalComponent } from 'ng2-bs3-modal';

import { Resource } from '@flogo-web/core';

import { FlogoFlowService as FlowsService } from '../core/flow.service';

@Component({
  selector: 'flogo-flow-sub-flow',
  templateUrl: 'sub-flow.component.html',
  styleUrls: ['sub-flow.component.less'],
})
export class SubFlowComponent implements AfterViewInit, OnInit {
  @Input()
  appId: string;
  @Input()
  currentFlow: string;
  @Output()
  flowSelected: EventEmitter<Resource | string> = new EventEmitter<Resource | string>();

  @ViewChild('listModal') modal: BsModalComponent;
  flowsList: Resource[];

  constructor(private flowService: FlowsService) {}

  ngOnInit() {
    this.flowService.listFlowsForApp(this.appId).subscribe(flows => {
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

  selectedFlow(flow: Resource) {
    this.flowSelected.emit(flow);
  }
}
