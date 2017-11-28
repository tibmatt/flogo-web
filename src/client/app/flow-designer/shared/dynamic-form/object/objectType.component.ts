import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseField } from '../field-base';

@Component({
  selector: 'flogo-fb-object',
  templateUrl: 'objectType.component.html',
  styleUrls: ['../shared/dynamic-form.less']
})

export class ObjectTypeComponent {
  @Input()
  fieldGroup: FormGroup;
  @Input()
  fieldControl: BaseField<any>;
}
