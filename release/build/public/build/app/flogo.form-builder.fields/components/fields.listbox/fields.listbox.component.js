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
var constants_1 = require('../../../../common/constants');
var EMPTY_OPTION = '<empty>';
var FlogoFormBuilderFieldsListBox = (function (_super) {
    __extends(FlogoFormBuilderFieldsListBox, _super);
    function FlogoFormBuilderFieldsListBox() {
        _super.call(this);
        this.options = [];
    }
    FlogoFormBuilderFieldsListBox.prototype.ngOnInit = function () {
        this.options = [EMPTY_OPTION].concat(this._info.allowed);
    };
    FlogoFormBuilderFieldsListBox.prototype.onChangeField = function (option) {
        if (option == EMPTY_OPTION) {
            option = constants_1.DEFAULT_VALUES_OF_TYPES[this._info.type];
        }
        this._info.value = option;
        this.publishNextChange();
    };
    FlogoFormBuilderFieldsListBox = __decorate([
        core_1.Component({
            selector: 'flogo-form-builder-fields-listbox',
            styles: [".flogo-field-listbox .list-caret {   margin-right: 5px; } .flogo-field-listbox .list-label {   color: #8493a8; } .flogo-field-listbox .list-label:active, .flogo-field-listbox .list-label:focus, .flogo-field-listbox .list-label:hover, .flogo-field-listbox .list-label:visited {   background-color: transparent; } .flogo-field-listbox .dropdown-toggle {   height: 45px; } .flogo-field-listbox .dropdown-toggle .caret {   margin-top: -1px; } .flogo-field-listbox .dropdown-toggle:hover {   color: #54657e;   border-color: #8493a8; } .flogo-field-listbox .dropdown-toggle:focus {   color: #3d4d65;   border-color: #0082d5; } .flogo-fields-base__error {   color: red; } .flogo-fields-header-field {   display: flex;   flex-direction: row;   justify-content: space-between;   margin-top: 10px; }"],
            moduleId: module.id,
            template: "<div class=\"flogo-field-listbox\">    <div class=\"flogo-fields-header-field\">     <label class=\"control-label\">{{_info.title}}</label>     <label class=\"control-label\" [hidden]=\"_info.required || _info.direction == 'output' \" >Optional</label>   </div>     <div class=\"dropdown\" style=\"width: 100%\">     <button style=\"width: 100%; text-align: left;\" class=\"btn btn-default dropdown-toggle list-label\" type=\"button\" id=\"dropdownMenu1\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\">       <span class=\"caret list-caret\"></span> <span class=\"\">{{_info.value}}</span>     </button>     <ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\">       <li *ngFor=\"let option of options\" (click)=\"onChangeField(option)\" style=\"cursor:pointer;\" class=\"list-label\"><a>{{option ? option : \"&nbsp;\"}}</a></li>     </ul>   </div>    <!--   <input type=\"text\" class=\"form-control tc-inputs\" [class.error]=\"_hasError\" [(ngModel)]=\"_info.value\"          [placeholder]=\"_info.placeholder\"          (keyup)=\"onChangeField($event)\"          (change)=\"onValidate($event)\"          [readonly]=\"isReadOnly()\">   -->    <div *ngIf=\"_hasError && _errorMessage\" class=\"control-group error\">     <label class=\"flogo-fields-base__error\">{{_errorMessage}}</label>   </div>  </div>",
            directives: [router_deprecated_1.ROUTER_DIRECTIVES],
            inputs: ['_info:info', '_fieldObserver:fieldObserver']
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoFormBuilderFieldsListBox);
    return FlogoFormBuilderFieldsListBox;
}(fields_base_component_1.FlogoFormBuilderFieldsBase));
exports.FlogoFormBuilderFieldsListBox = FlogoFormBuilderFieldsListBox;
