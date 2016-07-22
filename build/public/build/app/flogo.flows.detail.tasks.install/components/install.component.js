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
var installer_component_1 = require('../../flogo.installer/components/installer.component');
var FlogoFlowsDetailTasksInstallComponent = (function () {
    function FlogoFlowsDetailTasksInstallComponent() {
        this.activities = [];
        this.isActivated = false;
        this.onInstalled = new core_1.EventEmitter();
        this.isActivated = false;
    }
    FlogoFlowsDetailTasksInstallComponent.prototype.openModal = function () {
        this.isActivated = true;
    };
    FlogoFlowsDetailTasksInstallComponent.prototype.onInstalledAction = function (response) {
        this.onInstalled.emit(response);
    };
    FlogoFlowsDetailTasksInstallComponent = __decorate([
        core_1.Component({
            selector: 'flogo-flows-detail-tasks-install',
            directives: [installer_component_1.FlogoInstallerComponent],
            outputs: ['onInstalled: flogoOnInstalled'],
            moduleId: module.id,
            template: "<div>   <button type=\"button\" class=\"btn btn-link flogo-common-edit-panel__btn-download\"           (click)=\"openModal()\">     Install new Activity   </button>    <flogo-installer [flogoInstallType]=\"'activity'\" [(flogoIsActivated)]=\"isActivated\"                    (flogoOnInstalled)=\"onInstalledAction($event)\"></flogo-installer>  </div>",
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoFlowsDetailTasksInstallComponent);
    return FlogoFlowsDetailTasksInstallComponent;
}());
exports.FlogoFlowsDetailTasksInstallComponent = FlogoFlowsDetailTasksInstallComponent;
