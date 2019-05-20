import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'flogo-stream-params-schema-param-row',
  templateUrl: 'param-row.component.html',
  styleUrls: ['param-row.component.less'],
})

/**
 * @private
 */
export class ParamRowComponent {
  @Input() paramGroup: FormGroup;
  @Input() dropdownOptions;
  @Input() inputIndex;
  @Output() removeParam: EventEmitter<number> = new EventEmitter<number>();

  onRemoveParam() {
    this.removeParam.emit(this.inputIndex);
  }

  selectType(type) {
    this.paramGroup.patchValue({ type });
  }
}
