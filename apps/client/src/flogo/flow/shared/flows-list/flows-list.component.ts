import { Component, EventEmitter, Input, Output } from '@angular/core';
import {ActionBase} from '@flogo-web/client/core';

@Component({
  selector: 'flogo-flow-flows-list',
  templateUrl: 'flows-list.component.html',
  styleUrls: ['flows-list.component.less']
})
export class FlowsListComponent {
  @Input()
  list: ActionBase[];

  @Output()
  flowSelected: EventEmitter<ActionBase | string> = new EventEmitter<ActionBase | string>();
  @Output()
  flowSelectionCancel: EventEmitter<string> = new EventEmitter<string>();

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
    this.flowSelectionCancel.emit('cancel');
  }

  selectFlow(flow: ActionBase) {
    this.flowSelected.emit(flow);
  }
}
