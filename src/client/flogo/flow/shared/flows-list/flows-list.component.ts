import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'flogo-flow-flows-list',
  templateUrl: 'flows-list.component.html',
  styleUrls: ['flows-list.component.less']
})
export class FlowsListComponent {
  // TODO: Implement interface for the list
  @Input()
  list: any[];

  @Output()
  flowSelected: EventEmitter<any> = new EventEmitter<any>();

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

  selectFlow(flow: any) {
    this.flowSelected.emit(flow);
  }
}
