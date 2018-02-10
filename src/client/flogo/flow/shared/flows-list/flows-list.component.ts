import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Action } from '@flogo/core';

@Component({
  selector: 'flogo-flow-flows-list',
  templateUrl: 'flows-list.component.html',
  styleUrls: ['flows-list.component.less']
})
export class FlowsListComponent {
  @Input()
  list: Action[];

  @Output()
  flowSelected: EventEmitter<Action | string> = new EventEmitter<Action | string>();

  searchText: string;

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

  cancelList() {
    this.flowSelected.emit('cancel');
  }

  selectFlow(flow: Action) {
    this.flowSelected.emit(flow);
  }
}
