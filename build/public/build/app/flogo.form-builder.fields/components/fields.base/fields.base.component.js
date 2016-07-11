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
var FlogoFormBuilderFieldsBase = (function () {
    function FlogoFormBuilderFieldsBase() {
        this._hasError = false;
        this._hasError = false;
    }
    FlogoFormBuilderFieldsBase.prototype.onChangeField = function (event) {
        this._info.value = event.target.value;
        this.publishNextChange();
    };
    FlogoFormBuilderFieldsBase.prototype._getMessage = function (message, properties) {
        return _.assign({}, { message: message }, { payload: properties });
    };
    FlogoFormBuilderFieldsBase.prototype.publishNextChange = function () {
        this._fieldObserver.next(this._getMessage('change-field', this._info));
    };
    FlogoFormBuilderFieldsBase.prototype.isReadOnly = function () {
        if (this._info.isTrigger) {
            return false;
        }
        return this._info.direction == 'output';
    };
    FlogoFormBuilderFieldsBase.prototype.onValidate = function (event) {
        var value = event.target.value || '';
        if (this._info.required) {
            if (!value.trim()) {
                this._errorMessage = this._info.title + ' is required';
                this._hasError = true;
                this._fieldObserver.next(this._getMessage('validation', { status: 'error', field: this._info.name }));
                return;
            }
            else
                this._hasError = false;
            this._fieldObserver.next(this._getMessage('validation', { status: 'ok', field: this._info.name }));
        }
        if (this._info.validation) {
            if (!this._validate(value)) {
                this._hasError = true;
                this._errorMessage = this._info.validationMessage;
                this._fieldObserver.next(this._getMessage('validation', { status: 'error', field: this._info.name }));
            }
            else {
                this._hasError = false;
                this._fieldObserver.next(this._getMessage('validation', { status: 'ok', field: this._info.name }));
            }
        }
    };
    FlogoFormBuilderFieldsBase.prototype._validate = function (value) {
        var re = new RegExp(this._info.validation);
        return re.test(value);
    };
    FlogoFormBuilderFieldsBase = __decorate([
        core_1.Component({
            inputs: ['_info:info', '_fieldObserver:fieldObserver']
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoFormBuilderFieldsBase);
    return FlogoFormBuilderFieldsBase;
}());
exports.FlogoFormBuilderFieldsBase = FlogoFormBuilderFieldsBase;
