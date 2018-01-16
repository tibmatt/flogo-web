import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FlogoFlowService as FlowsService} from '@flogo/flow/core/flow.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'flogo-flow-flows-list',
  templateUrl: 'flows-list.component.html',
  styleUrls: ['flows-list.component.less']
})
export class FlowsListComponent implements AfterViewInit, OnInit {
  @Input()
  appId: string;
  @Output()
  onSelection: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('listModal') modal: ModalComponent;
  filteredFlows: any[];

  searchText: string;

  constructor(private flowService: FlowsService) {}

  ngOnInit() {
    this.flowService.listFlowsForApp(this.appId).then(flows => {
      this.filteredFlows = flows;
    });
  }

  ngAfterViewInit() {
    this.open();
  }

  open() {
    this.modal.open();
  }

  onModalCloseOrDismiss() {
    this.onSelection.emit('dismiss');
  }

  closeModal() {
    this.onModalCloseOrDismiss();
  }
}
