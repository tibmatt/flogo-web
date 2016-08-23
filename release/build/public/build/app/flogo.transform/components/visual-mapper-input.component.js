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
var VisualMapperInputComponent = (function () {
    function VisualMapperInputComponent() {
    }
    VisualMapperInputComponent.prototype.ngOnChanges = function (changes) {
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], VisualMapperInputComponent.prototype, "tileInputInfo", void 0);
    VisualMapperInputComponent = __decorate([
        core_1.Component({
            selector: 'flogo-transform-visual-mapper-input',
            moduleId: module.id,
            styles: ["/* .flogo-visual-mapper-input {   width: 90%;   background-color: yellow;   height: 100%; } */"],
            template: "<div class=\"flogo-visual-mapper-input\">     {{tileInputInfo.name}} </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], VisualMapperInputComponent);
    return VisualMapperInputComponent;
}());
exports.VisualMapperInputComponent = VisualMapperInputComponent;
