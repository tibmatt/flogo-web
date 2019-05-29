import { EventEmitter } from '@angular/core';
export class GroupByParamService {
  updateGroupByParam = new EventEmitter();
  selectedGroupByParam: string;

  updateGroupBy(groupByParam) {
    this.selectedGroupByParam = groupByParam;
    this.updateGroupByParam.emit(groupByParam);
  }
}
