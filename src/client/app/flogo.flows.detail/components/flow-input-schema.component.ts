import {Component, Input, ViewChild} from '@angular/core';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from "../../../common/constants";
import {IFlowMetadataAttribute} from "../models/profiles/microservice-converter.model";
import { FlogoFlowService as FlowsService } from '../services/flow.service';


@Component({
  selector: 'flogo-flow-input-schema',
  templateUrl: 'flow-input-schema.tpl.html',
  styleUrls: ['flow-input-schema.component.less']
})

export class FlogoFlowInputSchemaComponent {
  @ViewChild('modal')
  public modal: ModalComponent;
  @Input()  flow: any;
  selectTypes: any[] = [];
  selectedParam: string;
  public definedInputParams: IFlowMetadataAttribute[] = [];
  public definedOutputParams: IFlowMetadataAttribute[] = [];
  public otherInputItem: IFlowMetadataAttribute = {name: '', type: ''};
  public otherOutputItem: IFlowMetadataAttribute = {name: '', type: ''};
  displayInputParams: boolean;


  constructor(public translate: TranslateService,
              private _flowService: FlowsService,) {

  }
 getParams() {
   let options = Object.keys(FLOGO_TASK_ATTRIBUTE_TYPE);
   this.selectTypes = options.slice(options.length / 2);
   this.definedInputParams = this.flow.metadata.input.map(input => ({
     name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING')],
   }));
   this.definedOutputParams = this.flow.metadata.output.map(input => ({
     name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING')],
   }));
 }
  showOutputParams() {
    this.displayInputParams = false;
    this.getParams();
  };
  showInputParams(){
    this.displayInputParams = true;
  }

  public openInputSchemaModel() {
    this.displayInputParams = true;
    this.otherInputItem = {name: '', type: ''};
    this.modal.open();
    this.getParams();
  }

  selectParamType(option: string) {
    this.selectedParam = option;
    if (this.displayInputParams){
      this.otherInputItem.type = this.selectedParam;
    }else {
      this.otherOutputItem.type = this.selectedParam;
    }
  }

  addInputParams() {
    if (!this.otherInputItem.name || !this.otherInputItem.type) {
      return;
    }
    this.definedInputParams.push({name: this.otherInputItem.name, type: this.otherInputItem.type});
    this.otherInputItem = {name: '', type: ''};
  }
  addOutputParams() {
    if (!this.otherOutputItem.name || !this.otherOutputItem.type) {
      return;
    }
    this.definedOutputParams.push({name: this.otherOutputItem.name, type: this.otherOutputItem.type});
    this.otherOutputItem = {name: '', type: ''};
  }
   saveParams() {
     const inputOutputParams = [];
     console.log(this.flow);
     delete this.flow.metadata;
     this.addInputParams();
     this.flow.metadata = {
       'input': this.definedInputParams.map(input => ({
         name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING')],
       })),
       'output': this.definedOutputParams.map(input => ({
         name: input.name, type: FLOGO_TASK_ATTRIBUTE_TYPE[_.get(input, 'type', 'STRING')],
       }))
     };

     console.log(this.flow);
     return this._flowService.saveFlow(this.flow.id, this.flow).then(rsp => {
       console.groupCollapsed('Flow updated');
       console.log(rsp);
       console.groupEnd();
       return rsp;
     });

   }

  removeParams(param) {
    if (this.displayInputParams) {
      const inputIndex = this.definedInputParams.indexOf(param);
      if (inputIndex !== -1) {
        this.definedInputParams.splice(inputIndex, 1);
      }
    }else {
      const outputIndex = this.definedOutputParams.indexOf(param);
      if (outputIndex !== -1) {
        this.definedOutputParams.splice(outputIndex, 1);
      }
    }
  }

}

