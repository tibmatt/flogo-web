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
var FlogoFormBuilderFieldsObject = (function (_super) {
    __extends(FlogoFormBuilderFieldsObject, _super);
    function FlogoFormBuilderFieldsObject() {
        _super.call(this);
    }
    FlogoFormBuilderFieldsObject.prototype.ngOnInit = function () {
        if (_.isNumber(this._info.value) || _.isString(this._info.value) || _.isBoolean(this._info.value)) {
            this._value = '' + this._info.value;
            return;
        }
        if (this._info.value) {
            try {
                this._value = '' + JSON.stringify(this._info.value);
            }
            catch (err) { }
        }
    };
    FlogoFormBuilderFieldsObject = __decorate([
        core_1.Component({
            selector: 'flogo-form-builder-fields-object',
            styles: [".flogo-fields-base__error {   color: red; } .flogo-fields-header-field {   display: flex;   flex-direction: row;   justify-content: space-between;   margin-top: 10px; }"],
            moduleId: module.id,
            template: "<div class=\"flogo-field-object\">    <div class=\"flogo-fields-header-field\">     <label class=\"control-label\">{{_info.title}}</label>     <label class=\"control-label\" [hidden]=\"_info.required || _info.direction == 'output' \" >Optional</label>   </div>    <textarea rows=\"5\"             (keyup)=\"onChangeField($event)\"             [class.error]=\"_hasError\"             [placeholder]=\"_info.placeholder\"             class=\"form-control tc-text-areas tc-text-area\"             [(ngModel)]=\"_value\"             (change)=\"onValidate($event)\"             [readonly]=\"isReadOnly()\"></textarea>    <div *ngIf=\"_hasError && _errorMessage\" class=\"control-group error\">     <label class=\"flogo-fields-base__error\">{{_errorMessage}}</label>   </div> </div>",
            directives: [router_deprecated_1.ROUTER_DIRECTIVES],
            inputs: ['_info:info', '_fieldObserver:fieldObserver']
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoFormBuilderFieldsObject);
    return FlogoFormBuilderFieldsObject;
}(fields_base_component_1.FlogoFormBuilderFieldsBase));
exports.FlogoFormBuilderFieldsObject = FlogoFormBuilderFieldsObject;
