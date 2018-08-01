import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'flogo-flow-dynamic-field-group',
  templateUrl: './dynamic-field-group.component.html',
  styleUrls: ['./dynamic-field-group.component.less']
})
export class DynamicFieldGroupComponent {
  @Input() fieldGroup: FormGroup;
}
