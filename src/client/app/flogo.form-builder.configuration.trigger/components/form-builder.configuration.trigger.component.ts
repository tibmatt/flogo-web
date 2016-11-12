import {Component, SimpleChange} from '@angular/core';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';

import {
  FlogoFormBuilderFieldsRadio as FieldRadio,
  FlogoFormBuilderFieldsTextBox as FieldTextBox,
  FlogoFormBuilderFieldsTextArea as FieldTextArea,
  FlogoFormBuilderFieldsNumber as FieldNumber,
  FlogoFormBuilderFieldsObject as FieldObject,
  FlogoFormBuilderFieldsListBox as FieldListBox
} from '../../flogo.form-builder.fields/fields';

import {FlogoFormBuilderCommon} from '../../flogo.form-builder/form-builder.common';

@Component({
    selector: 'flogo-form-builder-trigger-configuration',
    moduleId: module.id,
    templateUrl: 'form-builder.configuration.trigger.tpl.html',
    directives: [FieldRadio, FieldTextBox, FieldTextArea, FieldNumber, FieldObject, FieldListBox],
    inputs: ['_fieldObserver:fieldObserver','_attributes:attributes'],
    pipes: [TranslatePipe],
    providers: [FlogoFormBuilderCommon]
})
export class FlogoFormBuilderConfigurationTriggerComponent {
  _fieldObserver : any;
  _attributes: any;
  fields:any;
  directions:any;

  constructor(private _commonService: FlogoFormBuilderCommon, public translate: TranslateService) {
    this.directions = _commonService.getParameterDirections();
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
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
