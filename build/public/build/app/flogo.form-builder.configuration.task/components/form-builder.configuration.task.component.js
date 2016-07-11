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
var form_builder_common_1 = require('../../flogo.form-builder/form-builder.common');
var fields_object_component_1 = require('../../flogo.form-builder.fields/components/fields.object/fields.object.component');
var utils_1 = require("../../../common/utils");
var FlogoFormBuilderConfigurationTaskComponent = (function () {
    function FlogoFormBuilderConfigurationTaskComponent(_commonService) {
        this._commonService = _commonService;
    }
    FlogoFormBuilderConfigurationTaskComponent.prototype.ngOnChanges = function (changes) {
        this.fields = {
            inputs: this._commonService.getStructureFromAttributes('inputs', this._attributes),
            outputs: this._commonService.getStructureFromAttributes('outputs', this._attributes),
        };
    };
    FlogoFormBuilderConfigurationTaskComponent.prototype.ngOnInit = function () {
    };
    FlogoFormBuilderConfigurationTaskComponent.prototype.getControlByType = function (type) {
        return this._commonService.getControlByType(type);
    };
    FlogoFormBuilderConfigurationTaskComponent.prototype._getMappingValue = function (info) {
        var resultValue = null;
        if (info.step) {
            var taskId_1 = utils_1.convertTaskID(this._task.id);
            if (info.direction === 'output') {
                resultValue = _.find(info.step.flow.attributes, function (attr) { return attr.name == "{A" + taskId_1 + "." + info.name + "}"; });
            }
            else {
                var mapping = _.find(info.mappings, function (mapping) { return mapping.mapTo === info.name; });
                var parsedMapping_1 = mapping ? utils_1.parseMapping(mapping.value) : null;
                if (parsedMapping_1) {
                    var resultHolder = _.find(info.step.flow.attributes, function (attr) {
                        return attr.name == parsedMapping_1.autoMap;
                    });
                    if (resultHolder) {
                        if (parsedMapping_1.path) {
                            resultValue = {
                                value: _.get(resultHolder.value, parsedMapping_1.path)
                            };
                        }
                        else {
                            resultValue = resultHolder;
                        }
                    }
                }
            }
        }
        return resultValue ? resultValue.value : info.value;
    };
    FlogoFormBuilderConfigurationTaskComponent.prototype.getTaskInfo = function (input, direction, structure) {
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
            isTrigger: false,
            isBranch: false,
            isTask: true,
            direction: direction,
            structure: structure
        };
        info.value = this._getMappingValue(info);
        return _.assign({}, info, this.getControlByType(input.type));
    };
    FlogoFormBuilderConfigurationTaskComponent = __decorate([
        core_1.Component({
            selector: 'flogo-form-builder-task-configuration',
            moduleId: module.id,
            template: "<div>    <div class=\"flogo-common-edit-panel__container\">     <h3 class=\"flogo-common-edit-panel__legend\" [hidden]=\"!fields.inputs.length\">Input</h3>     <div *ngFor=\"#item of fields.inputs; #index = index\" class=\"\">        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextBox'\">         <flogo-form-builder-fields-textbox [info]=\"getTaskInfo(item, 'input','inputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-textbox>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldNumber'\">         <flogo-form-builder-fields-number [info]=\"getTaskInfo(item, 'input','inputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-number>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldRadio'\">         <flogo-form-builder-fields-radio [info]=\"getTaskInfo(item, 'input','inputs')\" [fieldObserver]=\"_fieldObserver\" [index]=\"index\" ></flogo-form-builder-fields-radio>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextArea'\">         <flogo-form-builder-fields-textarea [info]=\"getTaskInfo(item, 'input','inputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-textarea>       </div>         <div *ngIf=\"getControlByType(item.type).control == 'FieldObject'\">         <flogo-form-builder-fields-object [info]=\"getTaskInfo(item, 'input','inputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-object>       </div>      </div>      <h3 class=\"flogo-common-edit-panel__legend\" [hidden]=\"!fields.outputs.length\">Output</h3>     <div *ngFor=\"#item of fields.outputs\" class=\"flogo-task-container__output\">        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextBox'\">         <flogo-form-builder-fields-textbox [info]=\"getTaskInfo(item, 'output','outputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-textbox>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldNumber'\">         <flogo-form-builder-fields-number [info]=\"getTaskInfo(item, 'output','outputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-number>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldRadio'\">         <flogo-form-builder-fields-radio [info]=\"getTaskInfo(item, 'output','outputs')\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-radio>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldTextArea'\">         <flogo-form-builder-fields-textarea [info]=\"getTaskInfo(item, 'output','outputs')\" [fieldObserver]=\"_fieldObserver\"  ></flogo-form-builder-fields-textarea>       </div>        <div *ngIf=\"getControlByType(item.type).control == 'FieldObject'\">         <flogo-form-builder-fields-object [info]=\"getTaskInfo(item, 'output','outputs')\" [fieldObserver]=\"_fieldObserver\"  ></flogo-form-builder-fields-object>       </div>      </div>   </div>    </div>",
            directives: [fields_radio_component_1.FlogoFormBuilderFieldsRadio, fields_textbox_component_1.FlogoFormBuilderFieldsTextBox, fields_textarea_component_1.FlogoFormBuilderFieldsTextArea, fields_number_component_1.FlogoFormBuilderFieldsNumber, fields_object_component_1.FlogoFormBuilderFieldsObject],
            inputs: ['_fieldObserver:fieldObserver', '_attributes:attributes', '_task:task'],
            providers: [form_builder_common_1.FlogoFormBuilderCommon]
        }), 
        __metadata('design:paramtypes', [form_builder_common_1.FlogoFormBuilderCommon])
    ], FlogoFormBuilderConfigurationTaskComponent);
    return FlogoFormBuilderConfigurationTaskComponent;
}());
exports.FlogoFormBuilderConfigurationTaskComponent = FlogoFormBuilderConfigurationTaskComponent;
