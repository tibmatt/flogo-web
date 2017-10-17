import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'flogo-flow-input',
  templateUrl: 'input.tpl.html',
  styleUrls: ['input.component.less']
})

export class FlogoFlowInputFieldComponent {
  @Input() public paramGroup: FormGroup;
  @Input() public totalCount: number;
  @Input() public dropdownOptions;
  @Input() public inputIndex;
  @Output() onRemoveParam: EventEmitter<number> = new EventEmitter<number>();
  @Output() onModifyParamType: EventEmitter<string> = new EventEmitter<string>();
  @Output() onAddParams: EventEmitter<string> = new EventEmitter<string>();

  removeParam() {
    this.onRemoveParam.emit();
  }

  modifyParamType(option, name) {
    const data: any = {};
    data.name = name;
    data.type = option;
    this.onModifyParamType.emit(data);
  }

  addParams() {
    this.onAddParams.emit();
  }
}
