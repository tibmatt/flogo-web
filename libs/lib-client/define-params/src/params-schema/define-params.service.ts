import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import { ValueType } from '@flogo-web/core';
import { isEmpty } from 'lodash';

@Injectable()
export class DefineParamsService {
  constructor(private _fb: FormBuilder) {}

  getInitForm() {
    return this._fb.group({
      input: this._fb.array([]),
      output: this._fb.array([]),
    });
  }

  getFormWithData(input, output) {
    return this._fb.group({
      input: this.mapAttributesToFormArray(input),
      output: this.mapAttributesToFormArray(output),
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

  createParamFormRow(data?: { name: string; type: string }) {
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
