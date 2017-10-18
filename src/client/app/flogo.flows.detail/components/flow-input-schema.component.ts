import {Component, Input, ViewChild, OnInit} from '@angular/core';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../common/constants';
import {FlogoFlowService as FlowsService} from '../services/flow.service';
import {FormGroup, FormArray, FormBuilder, Validators} from '@angular/forms';


@Component({
  selector: 'flogo-flow-input-schema',
  templateUrl: 'flow-input-schema.tpl.html',
  styleUrls: ['flow-input-schema.component.less']
})

export class FlogoFlowInputSchemaComponent implements OnInit {
  @ViewChild('modal')
  public modal: ModalComponent;
  @Input()
  public paramsForm: FormGroup;
  @Input() flow: any;
  selectTypes: any[] = [];
  displayInputParams: boolean;

  constructor(public translate: TranslateService,
              private _flowService: FlowsService,
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

  modifyParamType(event, index: number, fromParams: string) {
    const data: any = {};
    data.name = event.name;
    data.type = FLOGO_TASK_ATTRIBUTE_TYPE[event.type];
    const control = <FormArray>this.paramsForm.controls[fromParams];
    const paramControl = this.createParamRow(data);
    control.setControl(index, paramControl);
  }

  openInputSchemaModel() {
    this.displayInputParams = true;
    this.initForm();
    this.modal.open();
  }

  addParams(fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    const paramControl = this.createParamRow();
    control.push(paramControl);
  }

  saveParams(model: any) {
    this.flow.metadata = model.value;
    this.flow.metadata.input = this.flow.metadata.input.map(input => ({
      name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING')],
    }));
    this.flow.metadata.output = this.flow.metadata.output.map(output => ({
      name: output.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(output, 'type', 'STRING')],
    }));

    return this._flowService.saveFlow(this.flow.id, this.flow).then(rsp => {
      console.groupCollapsed('Flow updated');
      console.log(rsp);
      console.groupEnd();
      this.flow.metadata.input = this.flow.metadata.input.map(input => ({
        name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING').toUpperCase()],
      }));
      this.flow.metadata.output = this.flow.metadata.output.map(output => ({
        name: output.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(output, 'type', 'STRING').toUpperCase()],
      }));
      return rsp;
    });
  }

  removeParam(index: number, fromParams: string) {
    const control = <FormArray> this.paramsForm.controls[fromParams];
    control.removeAt(index);
  }

  private createParamRow(data?: { name: string, type: string }) {
    return this._fb.group({
      name: [data ? data.name : '', Validators.required],
      type: [data ? FLOGO_TASK_ATTRIBUTE_TYPE[data.type] : 'string'],
    });
  }

  private initForm() {
    this.paramsForm = this._fb.group({
      input: this._fb.array(this.flow.metadata.input.map(input => this.createParamRow(input))),
      output: this._fb.array(this.flow.metadata.output.map(output => this.createParamRow(output)))
    });
  }

}

