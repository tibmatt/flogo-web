import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FlogoFlowService as FlowsService} from '@flogo/flow/core/flow.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'flogo-flow-flows-list',
  templateUrl: 'flows-list.component.html',
  styleUrls: ['flows-list.component.less']
})
export class FlowsListComponent {
  @Input()
  list: any[];

  searchText: string;

  constructor() {}

  get filteredFlows() {
    if (this.searchText && !_.isEmpty(this.searchText.trim())) {
      return this.list.filter((flow) => {
        return (flow.name || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
          (flow.description || '').toLowerCase().includes(this.searchText.toLowerCase());
      });
    } else {
      return this.list;
    }
  }
}
