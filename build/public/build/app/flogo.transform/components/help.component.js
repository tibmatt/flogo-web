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
var components_1 = require('../../../common/components/components');
var HelpComponent = (function () {
    function HelpComponent() {
    }
    HelpComponent = __decorate([
        core_1.Component({
            selector: 'flogo-transform-help',
            directives: [components_1.CopyToClipboardComponent, components_1.InformationPopupComponent],
            moduleId: module.id,
            styles: [".code {   margin: 10px 0 0 0; } :host .btn-open {   border: none;   line-height: 1;   margin-top: -3px;   padding-bottom: 0;   padding-top: 0; } :host .flogo-clipboard-button {   font-size: 14px;   padding: 6px 12px;   position: absolute;   top: 12px;   right: 20px; }"],
            template: "<flogo-information-popup   [btnClasses]=\"'btn btn-link btn-open'\"   [btnText]=\"'Show example'\">   <flogo-information-popup-content>     Input mapping example     <flogo-copy-to-clipboard [element]=\"code\"></flogo-copy-to-clipboard>         <pre class=\"code\" #code>[{     \"type\": 1,     \"mapTo\": \"params.petId\",     \"value\": \"tibco-rest.params.petId\" }]</pre>   </flogo-information-popup-content> </flogo-information-popup>"
        }), 
        __metadata('design:paramtypes', [])
    ], HelpComponent);
    return HelpComponent;
}());
exports.HelpComponent = HelpComponent;
