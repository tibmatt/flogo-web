import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormBuilderService} from './form-builder.service';
import {BaseField} from './field-base';

@Component({
  selector: 'flogo-common-form-builder',
  templateUrl: 'form-builder.component.html'
})

export class FormBuilderComponent implements OnInit {
  @Input()
  fields: any;
  @Output()
  setFormGroup = new EventEmitter<FormGroup>();
  fieldsWithControlType: BaseField<any>[];
  fbForm: FormGroup;

  constructor( private formBuilder: FormBuilderService) {}

  ngOnInit() {
    const {formGroup, fieldsWithControlType} = this.formBuilder.toFormGroup(this.fields);
    this.fbForm = formGroup;
    this.fieldsWithControlType = fieldsWithControlType;
    this.setFormGroup.emit(this.fbForm);
  }
}
