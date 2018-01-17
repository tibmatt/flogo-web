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
  flowsList: any[];

  searchText: string;

  constructor(private flowService: FlowsService) {}

  get filteredFlows() {
    if (this.searchText && !_.isEmpty(this.searchText.trim())) {
      return this.flowsList.filter((flow) => {
        return (flow.name || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
          (flow.description || '').toLowerCase().includes(this.searchText.toLowerCase());
      });
    } else {
      return this.flowsList;
    }
  }

  ngOnInit() {
    this.flowService.listFlowsForApp(this.appId).then(flows => {
      this.flowsList = flows;
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
