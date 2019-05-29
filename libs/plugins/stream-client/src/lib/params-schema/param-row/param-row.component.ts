import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GroupByParamService } from './group-by-param.service';

@Component({
  selector: 'flogo-stream-params-schema-param-row',
  templateUrl: 'param-row.component.html',
  styleUrls: ['param-row.component.less'],
})

/**
 * @private
 */
export class ParamRowComponent implements OnInit {
  @Input() paramGroup: FormGroup;
  @Input() dropdownOptions;
  @Input() inputIndex;
  @Input() groupBy;
  @Output() removeParam: EventEmitter<number> = new EventEmitter<number>();
  showGroupByBtn = true;
  showChangeGroupByBtn = false;
  selectedAsGroupBy = false;

  constructor(private groupByParamService: GroupByParamService) {
    this.groupByParamService.updateGroupByParam.subscribe(groupBy => {
      this.setGroupBySelected();
    });
  }

  ngOnInit(): void {
    if (this.groupBy) {
      this.groupByParamService.updateGroupBy(this.groupBy);
    }
    this.setGroupBySelected();
  }

  setGroupBySelected() {
    const groupBy = this.groupByParamService.selectedGroupByParam;
    if (groupBy) {
      const inputParam =
        this.paramGroup &&
        this.paramGroup.get('name') &&
        this.paramGroup.get('name').value;
      if (inputParam === groupBy) {
        this.showGroupByBtn = true;
        this.showChangeGroupByBtn = false;
        this.selectedAsGroupBy = true;
      } else {
        this.showGroupByBtn = false;
        this.showChangeGroupByBtn = true;
        this.selectedAsGroupBy = false;
      }
    } else {
      this.showGroupByBtn = true;
      this.showChangeGroupByBtn = false;
      this.selectedAsGroupBy = false;
    }
  }

  onRemoveParam() {
    this.removeParam.emit(this.inputIndex);
  }

  selectType(type) {
    this.paramGroup.patchValue({ type });
  }

  selectGroupBy() {
    if (this.paramGroup.get('name').valid) {
      const param = this.paramGroup.get('name');
      this.groupByParamService.updateGroupBy(param.value);
    }
  }
}
