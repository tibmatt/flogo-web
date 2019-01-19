import { isEmpty } from 'lodash';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Resource } from '@flogo-web/core';

@Component({
  selector: 'flogo-flow-flows-list',
  templateUrl: 'flows-list.component.html',
  styleUrls: ['flows-list.component.less'],
})
export class FlowsListComponent {
  @Input()
  list: Resource[];

  @Output()
  flowSelected: EventEmitter<Resource | string> = new EventEmitter<Resource | string>();
  @Output()
  flowSelectionCancel: EventEmitter<string> = new EventEmitter<string>();

  searchText: string;

  get filteredFlows() {
    if (this.searchText && !isEmpty(this.searchText.trim())) {
      return this.list.filter(flow => {
        return (
          (flow.name || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
          (flow.description || '').toLowerCase().includes(this.searchText.toLowerCase())
        );
      });
    } else {
      return this.list;
    }
  }

  cancelList() {
    this.flowSelectionCancel.emit('cancel');
  }

  selectFlow(flow: Resource) {
    this.flowSelected.emit(flow);
  }
}
