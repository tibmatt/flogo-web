import { Component, Input, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../common/constants';
import { FormGroup, FormArray, FormBuilder, AbstractControl } from '@angular/forms';


@Component({
  selector: 'flogo-flow-input-schema',
  templateUrl: 'flow-input-schema.tpl.html',
  styleUrls: ['flow-input-schema.component.less']
})

export class FlogoFlowInputSchemaComponent implements OnInit {
  @ViewChild('modal')
  modal: ModalComponent;
  @Input()
  paramsForm: FormGroup;
  @Input() flow: any;
  @Output() save = new EventEmitter<{ input: any[], output: any[] }>();
  selectTypes: any[] = [];
  displayInputParams: boolean;

  constructor(public translate: TranslateService,
              private _fb: FormBuilder) {
    const options = Object.keys(FLOGO_TASK_ATTRIBUTE_TYPE);
    this.selectTypes = options.filter(o => _.isNaN(_.parseInt(o)) && o !== FLOGO_TASK_ATTRIBUTE_TYPE[FLOGO_TASK_ATTRIBUTE_TYPE.INT]);
  }

  ngOnInit() {
    this.paramsForm = this._fb.group({
      input: this._fb.array([]),
      output: this._fb.array([])
    });
  }

  showOutputParams() {
    this.displayInputParams = false;
  };

  showInputParams() {
    this.displayInputParams = true;
  }

  openInputSchemaModel() {
    this.displayInputParams = true;
    this.initForm();
    this.modal.open();
  }

  addParams(fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    const paramControl = this.createParamFormRow();
    control.push(paramControl);
  }

  saveParams() {
    const mapParamsToFlow = (params) => params
      // filter out empty attributes
      .filter(param => param.name && param.name.trim().length > 0)
      .map(param => ({
        name: param.name.trim(),
        type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(param, 'type', 'STRING')],
      }));

    const updatedParams = this.paramsForm.value;
    const input = mapParamsToFlow(updatedParams.input);
    const output = mapParamsToFlow(updatedParams.output);
    this.save.next({ input, output });
  }

  removeParam(index: number, fromParams: string) {
    const control = <FormArray> this.paramsForm.controls[fromParams];
    control.removeAt(index);
  }

  private initForm() {
    this.paramsForm = this._fb.group({
      input: this.mapAttributesToFormArray(this.flow.metadata.input),
      output: this.mapAttributesToFormArray(this.flow.metadata.output),
    });
  }

  private mapAttributesToFormArray(attributes: { name: string, type: string}[]) {
    const formArray = this._fb.array(
      attributes.map(attribute => this.createParamFormRow(attribute)),
      this.uniqueNameInGroupValidator,
    );
    // ensure default row
    if (formArray.length === 0) {
      formArray.push(this.createParamFormRow());
    }
    return formArray;
  }

  private createParamFormRow(data?: { name: string, type: string }) {
    return this._fb.group({
      name: [data ? data.name : ''],
      type: [data ? FLOGO_TASK_ATTRIBUTE_TYPE[data.type] : 'string'],
    });
  }

  private uniqueNameInGroupValidator(formArray: FormArray): {[key: string]: boolean} {
    const nameControls = formArray.controls.map(group => group.get('name'));
    const uniqueError = { uniqueName: true };
    let formArrayHasErrors = false;
    nameControls
      .forEach((nameControl: AbstractControl) => {
        const currentNameValue = nameControl.value && nameControl.value.trim();
        let controlHasErrors = false;
        if (currentNameValue) {
          const repeatedControls = nameControls.filter(c => c !== nameControl && c.value && c.value.trim() === currentNameValue);
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
          nameControl.setErrors(!_.isEmpty(newErrors) ? newErrors : null);
        }
      });
    return formArrayHasErrors ? uniqueError : null;
  }

}

