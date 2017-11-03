import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormBuilderService} from './form-builder.service';

@Component({
  selector: 'flogo-common-form-builder',
  templateUrl: 'form-builder.component.html'
})

export class FormBuilderComponent implements OnInit {
  fbForm: FormGroup;
  @Output()
  setFormGroup = new EventEmitter<FormGroup>();
  @Input()
  fields: any;

  constructor( private formBuilder: FormBuilderService) {}

  ngOnInit() {
    this.fbForm = this.formBuilder.toFormGroup(this.fields);
    this.setFormGroup.emit(this.fbForm);
  }
}
