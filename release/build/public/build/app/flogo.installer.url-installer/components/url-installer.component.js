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
var constants_1 = require('../../flogo.installer/constants');
var PLACEHOLDER = {
    activity: "Install activity from URL.",
    trigger: "Install trigger from URL."
};
var FlogoInstallerUrlComponent = (function () {
    function FlogoInstallerUrlComponent() {
        this.onInstallEvent = new core_1.EventEmitter();
        this.disableInstall = false;
    }
    FlogoInstallerUrlComponent.prototype.ngOnChanges = function (changes) {
        if (_.has(changes, 'installType')) {
            var currentValue = changes['installType'].currentValue;
            this.onInstallTypeChange();
        }
        if (_.has(changes, 'status')) {
            this.onInstallerStatusChange(changes['status'].currentValue);
        }
    };
    FlogoInstallerUrlComponent.prototype.onInstallTypeChange = function () {
        if (this.installType === 'trigger') {
            this.placeholder = PLACEHOLDER.trigger;
        }
        else {
            this.placeholder = PLACEHOLDER.activity;
        }
    };
    FlogoInstallerUrlComponent.prototype.onSourceUrlChange = function (newUrl) {
        this.sourceUrl = newUrl;
    };
    FlogoInstallerUrlComponent.prototype.onInstallAction = function (evt) {
        if (!this.disableInstall) {
            this.onInstallEvent.emit(this.sourceUrl);
        }
    };
    FlogoInstallerUrlComponent.prototype.onInstallerStatusChange = function (status) {
        if (status === constants_1.FLOGO_INSTALLER_STATUS_INSTALLING) {
            this.disableInstall = true;
        }
        else {
            this.disableInstall = false;
        }
    };
    FlogoInstallerUrlComponent = __decorate([
        core_1.Component({
            selector: 'flogo-installer-url',
            moduleId: module.id,
            directives: [],
            inputs: ['installType: flogoInstallType', 'status: flogoInstallerStatus'],
            outputs: ['onInstallEvent: flogoOnInstall'],
            template: "<input class=\"flogo-installer-url-installer-input\" type=\"text\" [placeholder]=\"placeholder\" [ngModel]=\"sourceUrl\"        (ngModelChange)=\"onSourceUrlChange($event)\"/><i class=\"flogo-installer-url-installer-download-icon\"                                                        [ngClass]=\"{ 'flogo-installer-url-installer-disabled': disableInstall }\"                                                        (click)=\"onInstallAction($event)\"></i>",
            styles: [":host {   display: block;   margin: 0;   padding: 0;   font-family: 'Source Sans Pro', 'Helvetica', 'Arial', sans-serif; } .flogo-installer-url-installer-download-icon {   display: inline-block;   width: 43px;   height: 43px;   background: url('/assets/svg/flogo.icon.download.svg') no-repeat center center;   background-size: 30px 30px;   cursor: pointer; } .flogo-installer-url-installer-download-icon.flogo-installer-url-installer-disabled {   cursor: progress;   background-image: url('/assets/svg/flogo.icon.download.disabled.svg'); } .flogo-installer-url-installer-input {   display: inline-block;   vertical-align: top;   padding: 10px 22px;   width: -moz-calc(100% - 43px);   width: -webkit-calc(100% - 43px);   width: calc(100% - 43px);   font-size: 15px;   border: solid 1px #0081CB; } .flogo-installer-url-installer-input:focus {   outline: none; }"]
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoInstallerUrlComponent);
    return FlogoInstallerUrlComponent;
}());
exports.FlogoInstallerUrlComponent = FlogoInstallerUrlComponent;
