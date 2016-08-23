"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var router_deprecated_1 = require('@angular/router-deprecated');
var fields_base_component_1 = require('../fields.base/fields.base.component');
var FlogoFormBuilderFieldsNumber = (function (_super) {
    __extends(FlogoFormBuilderFieldsNumber, _super);
    function FlogoFormBuilderFieldsNumber() {
        _super.call(this);
    }
    FlogoFormBuilderFieldsNumber = __decorate([
        core_1.Component({
            selector: 'flogo-form-builder-fields-number',
            styles: [".flogo-fields-base__error {   color: red; } .flogo-fields-header-field {   display: flex;   flex-direction: row;   justify-content: space-between;   margin-top: 10px; }"],
            moduleId: module.id,
            template: "<div class=\"flogo-field-number\">    <div class=\"flogo-fields-header-field\">     <label class=\"control-label\">{{_info.title}}</label>     <label class=\"control-label\" [hidden]=\"_info.required || _info.direction == 'output' \" >Optional</label>   </div>    <input type=\"number\" class=\"form-control tc-inputs\" [class.error]=\"_hasError\"  [(ngModel)]=\"_info.value\"          (keyup)=\"onChangeField($event)\"          [placeholder]=\"_info.placeholder\"          (change)=\"onValidate($event)\"          [readonly]=\"isReadOnly()\">   <div *ngIf=\"_hasError && _errorMessage\" class=\"control-group error\">     <label class=\"flogo-fields-base__error\">{{_errorMessage}}</label>   </div> </div>",
            directives: [router_deprecated_1.ROUTER_DIRECTIVES],
            inputs: ['_info:info', '_fieldObserver:fieldObserver']
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoFormBuilderFieldsNumber);
    return FlogoFormBuilderFieldsNumber;
}(fields_base_component_1.FlogoFormBuilderFieldsBase));
exports.FlogoFormBuilderFieldsNumber = FlogoFormBuilderFieldsNumber;
