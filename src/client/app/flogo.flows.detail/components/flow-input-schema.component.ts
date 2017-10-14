import {Component, Input, ViewChild} from '@angular/core';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../common/constants';
import {IFlowMetadataAttribute} from '../models/profiles/microservice-converter.model';
import {FlogoFlowService as FlowsService} from '../services/flow.service';


@Component({
  selector: 'flogo-flow-input-schema',
  templateUrl: 'flow-input-schema.tpl.html',
  styleUrls: ['flow-input-schema.component.less']
})

export class FlogoFlowInputSchemaComponent {
  @ViewChild('modal')
  public modal: ModalComponent;
  @Input() flow: any;
  selectTypes: any[] = [];
  selectedParam: string;
  hasInputChanges: boolean;
  hasOutputChanges: boolean;
  public definedInputParams: IFlowMetadataAttribute[] = [];
  public definedOutputParams: IFlowMetadataAttribute[] = [];
  public otherInputItem: IFlowMetadataAttribute = {name: '', type: 'string'};
  public otherOutputItem: IFlowMetadataAttribute = {name: '', type: 'string'};
  displayInputParams: boolean;


  constructor(public translate: TranslateService,
              private _flowService: FlowsService) {

  }

  getParams() {
    const options = Object.keys(FLOGO_TASK_ATTRIBUTE_TYPE);
    this.selectTypes = options.filter(o => _.isNaN(_.parseInt(o)) && o !== FLOGO_TASK_ATTRIBUTE_TYPE[FLOGO_TASK_ATTRIBUTE_TYPE.INT]);
    this.definedInputParams = this.flow.metadata.input.map(input => ({
      name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING')],
    }));
    this.definedOutputParams = this.flow.metadata.output.map(input => ({
      name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING')],
    }));
  }

  showOutputParams() {
    this.displayInputParams = false;
  };

  showInputParams() {
    this.displayInputParams = true;
  }

  modifySelectedInputType(option, input) {
    if (input.type !== option) {
      input.type = option;
      this.hasInputChanges = true;
    }
  }

  modifySelectedOutputType(option, output) {
    if (output.type !== option) {
      output.type = option;
      this.hasOutputChanges = true;
    }
  }

  public openInputSchemaModel() {
    this.displayInputParams = true;
    this.hasInputChanges = false;
    this.hasOutputChanges = false;
    this.otherInputItem = {name: '', type: 'string'};
    this.modal.open();
    this.getParams();
  }

  onChangeParams(name) {
    if (this.displayInputParams) {
      this.hasInputChanges = (!this.flow.metadata.input.find(input => input.name === name)) && (name !== '');
    } else {
      this.hasOutputChanges = (!this.flow.metadata.output.find(output => output.name === name)) && (name !== '');
    }
  };

  selectParamType(option: string) {
    this.selectedParam = option;
    if (this.displayInputParams) {
      this.otherInputItem.type = this.selectedParam;
    } else {
      this.otherOutputItem.type = this.selectedParam;
    }
  }

  addInputParams() {
    this.hasInputChanges = !this.flow.metadata.input.find(input => input.name === this.otherInputItem.name);
    if ((!this.otherInputItem.name || !this.otherInputItem.type) && (!this.hasInputChanges)) {
      return;
    }
    this.definedInputParams.push({name: this.otherInputItem.name, type: this.otherInputItem.type});
    this.otherInputItem = {name: '', type: 'string'};
  }

  addOutputParams() {
    this.hasOutputChanges = !this.flow.metadata.output.find(output => output.name === this.otherOutputItem.name);
    if ((!this.otherOutputItem.name || !this.otherOutputItem.type) && (!this.hasOutputChanges)) {
      return;
    }
    this.definedOutputParams.push({name: this.otherOutputItem.name, type: this.otherOutputItem.type});
    this.otherOutputItem = {name: '', type: 'string'};
  }

  saveParams() {
    this.addInputParams();
    this.addOutputParams();
    this.flow.metadata = {
      'input': this.definedInputParams.map(input => ({
        name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING')],
      })),
      'output': this.definedOutputParams.map(output => ({
        name: output.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(output, 'type', 'STRING')],
      }))
    };
    this.closeParamsModal();

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

  closeParamsModal() {
    this.definedInputParams = [];
    this.definedOutputParams = [];

  }

  removeParams(param) {
    if (this.displayInputParams) {
      const inputIndex = this.definedInputParams.indexOf(param);
      if (inputIndex !== -1) {
        this.definedInputParams.splice(inputIndex, 1);
        this.hasInputChanges = true;
      }
    } else {
      const outputIndex = this.definedOutputParams.indexOf(param);
      if (outputIndex !== -1) {
        this.definedOutputParams.splice(outputIndex, 1);
        this.hasOutputChanges = true;
      }
    }
  }

}

