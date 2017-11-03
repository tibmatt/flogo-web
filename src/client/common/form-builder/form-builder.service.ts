import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormFieldService} from './form-field.service';
import {BaseField} from './field-base';
import {FieldAttribute} from './field-attribute';

@Injectable()
export class FormBuilderService {
  constructor(private ngFB: FormBuilder, private formService: FormFieldService) {
  }

  toFormGroup(fields: FieldAttribute[]) {
    const fieldsControlTypeGroup = fields.map(f => this.formService.mapFieldsToControlType(f));
    return this.ngFB.group({formFields: this.makeFormFieldsArray(fieldsControlTypeGroup)});
  }

  private makeFormFieldsArray(fieldsGroup: BaseField<any>[]) {
    return this.ngFB.array(fieldsGroup.map(fg => this.makeFormFieldGroup(fg)));
  }

  private makeFormFieldGroup(fieldControl: BaseField<any>) {
    const group: any = {};
    group.name = [fieldControl.name, Validators.required];
    group.type = [fieldControl.type, Validators.required];
    group.value = [fieldControl.value];
    if (fieldControl.required) {
      group.value.push(Validators.required);
    }
    return this.ngFB.group(group);
  }
}
