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
var FlogoFormBuilderConfigurationBranchComponent = (function () {
    function FlogoFormBuilderConfigurationBranchComponent(_commonService) {
        this._commonService = _commonService;
    }
    FlogoFormBuilderConfigurationBranchComponent.prototype.ngOnInit = function () {
        this.fields = this._attributes;
    };
    FlogoFormBuilderConfigurationBranchComponent.prototype.getBranchInfo = function (branchInfo) {
        var info = {
            name: 'condition',
            id: branchInfo.id,
            title: 'If',
            value: branchInfo.condition,
            required: true,
            placeholder: '',
            isBranch: true,
            isTrigger: false,
            isTask: false
        };
        return info;
    };
    FlogoFormBuilderConfigurationBranchComponent = __decorate([
        core_1.Component({
            selector: 'flogo-form-builder-branch-configuration',
            moduleId: module.id,
            template: "<div class=\"flogo-common-edit-panel__container\">    <div *ngFor=\"#item of fields\">     <flogo-form-builder-fields-object [info]=\"getBranchInfo(item)\" [fieldObserver]=\"_fieldObserver\" ></flogo-form-builder-fields-object>   </div>  </div>",
            directives: [fields_radio_component_1.FlogoFormBuilderFieldsRadio, fields_textbox_component_1.FlogoFormBuilderFieldsTextBox, fields_textarea_component_1.FlogoFormBuilderFieldsTextArea, fields_number_component_1.FlogoFormBuilderFieldsNumber, fields_object_component_1.FlogoFormBuilderFieldsObject],
            inputs: ['_fieldObserver:fieldObserver', '_attributes:attributes'],
            providers: [form_builder_common_1.FlogoFormBuilderCommon]
        }), 
        __metadata('design:paramtypes', [form_builder_common_1.FlogoFormBuilderCommon])
    ], FlogoFormBuilderConfigurationBranchComponent);
    return FlogoFormBuilderConfigurationBranchComponent;
}());
exports.FlogoFormBuilderConfigurationBranchComponent = FlogoFormBuilderConfigurationBranchComponent;
