import {Component, SimpleChange} from '@angular/core';

import {FlogoFormBuilderCommon} from '../../flogo.form-builder/form-builder.common';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
    selector: 'flogo-form-builder-trigger-configuration',
    moduleId: module.id,
    templateUrl: 'form-builder.configuration.trigger.tpl.html',
    inputs: ['_fieldObserver:fieldObserver','_attributes:attributes', '_context:context'],
    styleUrls: ['form-builder.configuration.trigger.css']
})
export class FlogoFormBuilderConfigurationTriggerComponent {
  _fieldObserver : any;
  _attributes: any;
  _context: any;
  fields:any;
  directions:any;
  numFlowUseTrigger: number;
  messageNumFlowsUsed: string;

  constructor(private _commonService: FlogoFormBuilderCommon,
              public translate: TranslateService,) {
    this.directions = _commonService.getParameterDirections();
    this.numFlowUseTrigger = 1;
    this.updateMessageNumFlowsUsed();
  }

  updateMessageNumFlowsUsed() {
    this.messageNumFlowsUsed = this.translate.instant('FORM-BUILDER-CONFIGURATION-TRIGGER:EDIT', {value: this.numFlowUseTrigger});
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if(changes['_context']) {
      try {
        this.numFlowUseTrigger =  this._context.app.triggers[0].handlers.length;
        this.updateMessageNumFlowsUsed();
      }catch(err) {
        this.numFlowUseTrigger = 1;
        console.log(err);
      }
    }
    this.fields = {
      endpointSettings: this._commonService.getStructureFromAttributes('endpointSettings', this._attributes),
      settings:         this._commonService.getStructureFromAttributes('settings', this._attributes),
      outputs:          this._commonService.getStructureFromAttributes('outputs', this._attributes)
    }
  }

  ngOnInit() {
  }

  getControlByType(item:any, parameterDirection?:string) :any {

    return this._commonService.getControlByType(item,parameterDirection);
  }

  //TODO define interface
  getTriggerInfo(input:any, direction:string, structure:string) : any {
    var info = {
      name:       input.name,
      type:       input.type,
      title:      input.title || input.name || '',
      value:      input.value,
      mappings:   input.mappings,
      step:       input.step,
      validation: input.validation,
      validationMessage: input.validationMessage,
      required:   input.required || false,
      placeholder: input.placeholder || '',
      isTask: false,
      isTrigger:  true,
      isBranch:   false,
      direction: direction || '',
      // subfield where this item is located
      structure: structure || '',
      allowed: input.allowed
    };

    return _.assign({}, info, this.getControlByType(input.type));
  }



}
