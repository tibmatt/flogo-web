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
var InformationPopupComponent = (function () {
    function InformationPopupComponent(_eref) {
        this._eref = _eref;
        this.isOpen = false;
    }
    InformationPopupComponent.prototype.open = function (event) {
        this.isOpen = true;
        event.stopPropagation();
    };
    InformationPopupComponent.prototype.onClick = function (event) {
        var nativeElement = this._eref.nativeElement;
        if (event.target !== nativeElement && !nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    };
    __decorate([
        core_1.HostBinding('class.is-open'), 
        __metadata('design:type', Boolean)
    ], InformationPopupComponent.prototype, "isOpen", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], InformationPopupComponent.prototype, "btnClasses", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], InformationPopupComponent.prototype, "btnText", void 0);
    __decorate([
        core_1.HostListener('document:click', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Event]), 
        __metadata('design:returntype', void 0)
    ], InformationPopupComponent.prototype, "onClick", null);
    InformationPopupComponent = __decorate([
        core_1.Component({
            selector: 'flogo-information-popup',
            template: "\n    <button (click)=\"open($event)\" class=\"{{ btnClasses }}\">{{ btnText }}</button>\n    <div class=\"flogo-information-popup__popup\"><ng-content select=\"flogo-information-popup-content\"></ng-content></div>\n  ",
            styles: ["\n  :host {\n    display: inline-block;\n    position: relative;\n  }\n  \n  .flogo-information-popup__popup {\n    color: #fff;\n    visibility: hidden;\n    margin-top: 17px;\n    position: absolute;\n    left: -125%;\n    top: 100%;\n    width: 400px;\n    \n    background-color: #0081cb;\n    border-radius: 4px;\n    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);\n    padding: 20px;\n    \n    pointer-events: none;\n    \n    transition: all .2s ease-in-out;\n    opacity: 0;\n    transform: translateY(-20px);\n    \n  }\n  \n  .flogo-information-popup__popup:after {\n    border-left: solid transparent 15px;\n    border-right: solid transparent 15px;\n    border-bottom: solid #0081cb 14px;\n    top: -14px;\n    content: \" \";\n    height: 0;\n    left: 50%;\n    margin-left: -13px;\n    position: absolute;\n    width: 0;\n  }\n  \n  :host(.is-open) .flogo-information-popup__popup {\n     pointer-events: auto;\n     opacity: 1;\n     transform: translateY(0%);\n     visibility: visible; \n  }\n  "]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], InformationPopupComponent);
    return InformationPopupComponent;
}());
exports.InformationPopupComponent = InformationPopupComponent;
