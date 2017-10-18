import { Component, Input, Output, EventEmitter } from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'flogo-flow-input',
  templateUrl: 'input.component.html',
  styleUrls: ['input.component.less']
})

export class FlogoFlowInputFieldComponent {
  @Input() paramGroup: FormGroup;
  @Input() dropdownOptions;
  @Input() inputIndex;
  @Output() onRemoveParam: EventEmitter<number> = new EventEmitter<number>();

  removeParam() {
    this.onRemoveParam.emit(this.inputIndex);
  }

  selectType(type) {
    this.paramGroup.patchValue({ type });
  }

  // addParams() {
  //   this.onAddParams.emit();
  // }
}
