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
var ErrorDisplayComponent = (function () {
    function ErrorDisplayComponent() {
        this.errors = {};
    }
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ErrorDisplayComponent.prototype, "errors", void 0);
    ErrorDisplayComponent = __decorate([
        core_1.Component({
            selector: 'flogo-transform-error-display',
            moduleId: module.id,
            template: "<div *ngIf=\"errors\" class=\"tc-notifications tc-notifications-error wrapper\" style=\"width: 100%; min-width: 1px\">   <div class=\"tc-notifications-message\">     <div>Errors found</div>   </div>    <ul>     <li *ngIf=\"errors.invalidJson\">Invalid json</li>     <li *ngIf=\"errors.notArray\">Mappings should be an array</li>     <template [ngIf]=\"errors.invalidMappings\">       <li *ngFor=\"let mapErrors of errors.invalidMappings.errors\">         Error found in mapping at position {{ mapErrors.index }}:         <ul>           <li *ngIf=\"mapErrors.errors.notObject\">Not an object</li>           <li *ngIf=\"mapErrors.errors.type?.missing\">Missing or empty property \"type\"</li>           <li *ngIf=\"mapErrors.errors.type?.invalidValue\">\"{{ mapErrors.value.type }}\" is not a valid value for             property \"type\"           </li>           <li *ngIf=\"mapErrors.errors.value?.missing\">Missing or empty property \"value\"</li>           <li *ngIf=\"mapErrors.errors.value?.invalidValue\">Cannot find \"{{ mapErrors.value.value }}\" to map to property \"value\"           </li>           <li *ngIf=\"mapErrors.errors.mapTo?.missing\">Missing or empty property \"mapTo\"</li>           <li *ngIf=\"mapErrors.errors.mapTo?.invalidValue\">Cannot find input named \"{{ mapErrors.value.mapTo }}\" to map to.           </li>         </ul>       </li>     </template>   </ul>  </div>",
            styles: [":host {   display: flex;   flex: 1;   flex-direction: column;   font-size: 14px; } .wrapper {   flex: 1;   height: 100%;   overflow-y: hidden; } ul {   padding-top: 0; }"]
        }), 
        __metadata('design:paramtypes', [])
    ], ErrorDisplayComponent);
    return ErrorDisplayComponent;
}());
exports.ErrorDisplayComponent = ErrorDisplayComponent;
