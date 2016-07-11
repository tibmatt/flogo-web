"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var fields_radio_component_1 = require('../../flogo.form-builder.fields/components/fields.radio/fields.radio.component');
var fields_textbox_component_1 = require('../../flogo.form-builder.fields/components/fields.textbox/fields.textbox.component');
var fields_textarea_component_1 = require('../../flogo.form-builder.fields/components/fields.textarea/fields.textarea.component');
var fields_number_component_1 = require('../../flogo.form-builder.fields/components/fields.number/fields.number.component');
var fields_object_component_1 = require('../../flogo.form-builder.fields/components/fields.object/fields.object.component');
var form_builder_common_1 = require('../../flogo.form-builder/form-builder.common');
var FlogoFormBuilderConfigurationTriggerComponent = (function () {
    function FlogoFormBuilderConfigurationTriggerComponent(_commonService) {
        this._commonService = _commonService;
    }
    FlogoFormBuilderConfigurationTriggerComponent.prototype.ngOnChanges = function (changes) {
        this.fields = {
            endpointSettings: this._commonService.getStructureFromAttributes('endpointSettings', this._attributes),
            settings: this._commonService.getStructureFromAttributes('settings', this._attributes),
            outputs: this._commonService.getStructureFromAttributes('outputs', this._attributes)
        };
    };
    FlogoFormBuilderConfigurationTriggerComponent.prototype.ngOnInit = function () {
    };
    FlogoFormBuilderConfigurationTriggerComponent.prototype.getControlByType = function (type) {
        return this._commonService.getControlByType(type);
    };
    FlogoFormBuilderConfigurationTriggerComponent.prototype.getTriggerInfo = function (input, direction, structure) {
        var info = {
            name: input.name,
            type: input.type,
            title: input.title || input.name || '',
            value: input.value,
            mappings: input.mappings,
            step: input.step,
            validation: input.validation,
            validationMessage: input.validationMessage,
            required: input.required || false,
            placeholder: input.placeholder || '',
            isTask: false,
            isTrigger: true,
            isBranch: false,
            direction: direction || '',
            structure: structure || ''
        };
        return _.assign({}, info, this.getControlByType(input.type));
    };
    FlogoFormBuilderConfigurationTriggerComponent = __decorate([
        core_1.Component({
            selector: 'flogo-form-builder-trigger-configuration',
            moduleId: module.id,
            template: "<div>   <div  class=\"flogo-common-edit-panel__container\">     <h3 class=\"flogo-common-edit-panel__legend\" [hidden]=\"!fields.settings.length\">Settings</h3>     <div *ngFor=\"#item of fields.settings\" class=\"\">        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextBox'\">         <flogo-form-builder-fields-textbox [info]=\"getTriggerInfo(item, 'input', 'settings')\"  [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-textbox>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldNumber'\">         <flogo-form-builder-fields-number [info]=\"getTriggerInfo(item, 'input', 'settings')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-number>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextArea'\">         <flogo-form-builder-fields-textarea [info]=\"getTriggerInfo(item, 'input', 'settings')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-textarea>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldRadio'\">         <flogo-form-builder-fields-radio [info]=\"getTriggerInfo(item, 'input', 'settings')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-radio>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldObject'\">         <flogo-form-builder-fields-object [info]=\"getTriggerInfo(item, 'input', 'settings')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-object>       </div>      </div>      <h3 class=\"flogo-common-edit-panel__legend\" [hidden]=\"!fields.endpointSettings.length\">End point</h3>     <div *ngFor=\"#item of fields.endpointSettings\" class=\"\">        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextBox'\">         <flogo-form-builder-fields-textbox [info]=\"getTriggerInfo(item, 'input', 'endpointSettings')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-textbox>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldNumber'\">         <flogo-form-builder-fields-number [info]=\"getTriggerInfo(item, 'input', 'endpointSettings')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-number>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextArea'\">         <flogo-form-builder-fields-textarea [info]=\"getTriggerInfo(item, 'input', 'endpointSettings')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-textarea>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldRadio'\">         <flogo-form-builder-fields-radio [info]=\"getTriggerInfo(item, 'input', 'endpointSettings')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-radio>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldObject'\">         <flogo-form-builder-fields-object [info]=\"getTriggerInfo(item, 'input', 'endpointSettings')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-object>       </div>      </div>      <h3 class=\"flogo-common-edit-panel__legend\" [hidden]=\"!fields.outputs.length\">Outputs</h3>     <div *ngFor=\"#item of fields.outputs\" class=\"\">        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextBox'\">         <flogo-form-builder-fields-textbox [info]=\"getTriggerInfo(item, 'output', 'outputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-textbox>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldNumber'\">         <flogo-form-builder-fields-number [info]=\"getTriggerInfo(item, 'output', 'outputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-number>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextArea'\">         <flogo-form-builder-fields-textarea [info]=\"getTriggerInfo(item, 'output', 'outputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-textarea>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldRadio'\">         <flogo-form-builder-fields-radio [info]=\"getTriggerInfo(item, 'output', 'outputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-radio>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldObject'\">         <flogo-form-builder-fields-object [info]=\"getTriggerInfo(item, 'output', 'outputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-object>       </div>      </div>    </div> </div>",
            directives: [fields_radio_component_1.FlogoFormBuilderFieldsRadio, fields_textbox_component_1.FlogoFormBuilderFieldsTextBox, fields_textarea_component_1.FlogoFormBuilderFieldsTextArea, fields_number_component_1.FlogoFormBuilderFieldsNumber, fields_object_component_1.FlogoFormBuilderFieldsObject],
            inputs: ['_fieldObserver:fieldObserver', '_attributes:attributes'],
            providers: [form_builder_common_1.FlogoFormBuilderCommon]
        }), 
        __metadata('design:paramtypes', [form_builder_common_1.FlogoFormBuilderCommon])
    ], FlogoFormBuilderConfigurationTriggerComponent);
    return FlogoFormBuilderConfigurationTriggerComponent;
}());
exports.FlogoFormBuilderConfigurationTriggerComponent = FlogoFormBuilderConfigurationTriggerComponent;
