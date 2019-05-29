import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { isEmpty } from 'lodash';

import { BsModalComponent } from 'ng2-bs3-modal';

import { ValueType, Metadata } from '@flogo-web/core';
import { StreamParams } from '../core/interfaces/flow';

@Component({
  selector: 'flogo-stream-params-schema',
  templateUrl: 'params-schema.component.html',
  styleUrls: ['params-schema.component.less'],
})
export class ParamsSchemaComponent implements OnInit {
  @ViewChild('modal')
  modal: BsModalComponent;
  @Input()
  paramsForm: FormGroup;
  @Input() metadata: Metadata;
  @Output() save = new EventEmitter<StreamParams>();
  selectTypes: ValueType[] = [];
  displayInputParams: boolean;

  constructor(private _fb: FormBuilder) {
    this.selectTypes = Array.from(ValueType.allTypes);
  }

  ngOnInit() {
    this.paramsForm = this._fb.group({
      input: this._fb.array([]),
      output: this._fb.array([]),
    });
  }

  showOutputParams() {
    this.displayInputParams = false;
  }

  showInputParams() {
    this.displayInputParams = true;
  }

  openInputSchemaModel() {
    this.displayInputParams = true;
    this.initForm();
    this.modal.open();
  }

  closeInputSchemaModel() {
    this.displayInputParams = false;
    this.modal.close();
  }

  addParams(fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    const paramControl = this.createParamFormRow();
    control.push(paramControl);
  }

  saveParams() {
    const mapParamsToFlow = params =>
      params
        // filter out empty attributes
        .filter(param => param.name && param.name.trim().length > 0)
        .map(param => ({
          name: param.name.trim(),
          type: param.type || ValueType.String,
        }));

    const updatedParams = this.paramsForm.value;
    const input = mapParamsToFlow(updatedParams.input);
    const output = mapParamsToFlow(updatedParams.output);
    const metadata = { input, output };
    this.save.next({ metadata, groupBy: 'test' });
    this.closeInputSchemaModel();
  }

  removeParam(index: number, fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    control.removeAt(index);
  }

  private initForm() {
    const metadata = this.metadata || ({} as any);
    this.paramsForm = this._fb.group({
      input: this.mapAttributesToFormArray(metadata.input || []),
      output: this.mapAttributesToFormArray(metadata.output || []),
    });
  }

  private mapAttributesToFormArray(attributes: { name: string; type: string }[]) {
    const formArray = this._fb.array(
      attributes.map(attribute => this.createParamFormRow(attribute)),
      this.uniqueNameInGroupValidator
    );
    // ensure default row
    if (formArray.length === 0) {
      formArray.push(this.createParamFormRow());
    }
    return formArray;
  }

  private createParamFormRow(data?: { name: string; type: string }) {
    return this._fb.group({
      name: [data ? data.name : ''],
      type: [data ? data.type : ValueType.String],
    });
  }

  private uniqueNameInGroupValidator(formArray: FormArray): { [key: string]: boolean } {
    const nameControls = formArray.controls.map(group => group.get('name'));
    const uniqueError = { uniqueName: true };
    let formArrayHasErrors = false;
    nameControls.forEach((nameControl: AbstractControl) => {
      const currentNameValue = nameControl.value && nameControl.value.trim();
      let controlHasErrors = false;
      if (currentNameValue) {
        const repeatedControls = nameControls.filter(
          c => c !== nameControl && c.value && c.value.trim() === currentNameValue
        );
        if (repeatedControls.length > 0) {
          formArrayHasErrors = true;
          controlHasErrors = true;
          [nameControl, ...repeatedControls].forEach(control => {
            control.setErrors(Object.assign({}, control.errors || {}, uniqueError));
            // control.updateValueAndValidity({onlySelf: true});
          });
        }
      }
      if (!controlHasErrors) {
        const newErrors = nameControl.errors;
        if (newErrors) {
          delete newErrors['uniqueName'];
        }
        nameControl.setErrors(!isEmpty(newErrors) ? newErrors : null);
      }
    });
    return formArrayHasErrors ? uniqueError : null;
  }
}
