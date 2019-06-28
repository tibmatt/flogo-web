import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { BsModalComponent } from 'ng2-bs3-modal';

import { ValueType } from '@flogo-web/core';
import { DefineParamsService } from '@flogo-web/lib-client/define-params';

@Component({
  selector: 'flogo-flow-params-schema',
  templateUrl: 'params-schema.component.html',
  styleUrls: ['params-schema.component.less'],
})
export class ParamsSchemaComponent implements OnInit {
  @ViewChild('modal', { static: true })
  modal: BsModalComponent;
  paramsForm: FormGroup;
  @Input() flow: any;
  @Output() save = new EventEmitter<{ input: any[]; output: any[] }>();
  selectTypes: ValueType[] = [];
  displayInputParams: boolean;

  constructor(private defineParamsService: DefineParamsService) {
    this.selectTypes = Array.from(ValueType.allTypes);
  }

  ngOnInit() {
    this.paramsForm = this.defineParamsService.getInitForm();
  }

  showOutputParams() {
    this.displayInputParams = false;
  }

  showInputParams() {
    this.displayInputParams = true;
  }

  openInputSchemaModel() {
    this.displayInputParams = true;
    this.paramsForm = this.defineParamsService.getFormWithData(
      this.flow.metadata.input,
      this.flow.metadata.output
    );
    this.modal.open();
  }

  closeInputSchemaModel() {
    this.displayInputParams = false;
    this.modal.close();
  }

  addParams(fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    const paramControl = this.defineParamsService.createParamFormRow();
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
    this.save.next({ input, output });
    this.closeInputSchemaModel();
  }

  removeParam(index: number, fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    control.removeAt(index);
  }
}
