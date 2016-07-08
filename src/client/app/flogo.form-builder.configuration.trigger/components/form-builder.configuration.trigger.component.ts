import {Component, SimpleChange} from '@angular/core';

import {FlogoFormBuilderFieldsRadio as FieldRadio} from '../../flogo.form-builder.fields/components/fields.radio/fields.radio.component';
import {FlogoFormBuilderFieldsTextBox as FieldTextBox} from '../../flogo.form-builder.fields/components/fields.textbox/fields.textbox.component';
import {FlogoFormBuilderFieldsTextArea as FieldTextArea} from '../../flogo.form-builder.fields/components/fields.textarea/fields.textarea.component';
import {FlogoFormBuilderFieldsNumber as FieldNumber} from '../../flogo.form-builder.fields/components/fields.number/fields.number.component';
import {FlogoFormBuilderFieldsObject as FieldObject} from '../../flogo.form-builder.fields/components/fields.object/fields.object.component';
import {FlogoFormBuilderCommon} from '../../flogo.form-builder/form-builder.common';

@Component({
    selector: 'flogo-form-builder-trigger-configuration',
    moduleId: module.id,
    templateUrl: 'form-builder.configuration.trigger.tpl.html',
    directives: [FieldRadio, FieldTextBox, FieldTextArea, FieldNumber, FieldObject],
    inputs: ['_fieldObserver:fieldObserver','_attributes:attributes'],
    providers: [FlogoFormBuilderCommon]
})
export class FlogoFormBuilderConfigurationTriggerComponent {
  _fieldObserver : any;
  _attributes: any;
  fields:any;

  constructor(private _commonService: FlogoFormBuilderCommon) {
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

  getControlByType(type:string) :any {
    return this._commonService.getControlByType(type);
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
      structure: structure || ''
    };

    return _.assign({}, info, this.getControlByType(input.type));
  }



}
