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
var constants_1 = require('../../common/constants');
var FlogoFormBuilderCommon = (function () {
    function FlogoFormBuilderCommon() {
    }
    FlogoFormBuilderCommon.prototype.getStructureFromAttributes = function (structure, attributes) {
        var returnValue = _.get(attributes, structure, []);
        return this._getArray(returnValue);
    };
    FlogoFormBuilderCommon.prototype._getArray = function (obj) {
        if (!Array.isArray(obj)) {
            return [];
        }
        return obj;
    };
    FlogoFormBuilderCommon.prototype._mapTypeToConstant = function (type) {
        switch (type) {
            case 'string':
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
                return constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING;
            case 'number':
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
                return constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER;
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
            case 'boolean':
                return constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN;
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
            case 'object':
                return constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT;
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS:
            case 'map':
            case 'params':
                return constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS;
            default:
                return constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING;
        }
    };
    FlogoFormBuilderCommon.prototype.getControlByType = function (type) {
        switch (this._mapTypeToConstant(type)) {
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
                return { control: 'FieldTextBox' };
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
                return { control: 'FieldNumber' };
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
                return { control: 'FieldRadio' };
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS:
                return { control: 'FieldTextArea' };
            case constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
                return { control: 'FieldObject' };
            default:
                return { control: 'FieldTextBox' };
        }
    };
    FlogoFormBuilderCommon = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], FlogoFormBuilderCommon);
    return FlogoFormBuilderCommon;
}());
exports.FlogoFormBuilderCommon = FlogoFormBuilderCommon;
