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
var router_deprecated_1 = require('@angular/router-deprecated');
var category_selector_component_1 = require('../../flogo.installer.category-selector/components/category-selector.component');
var ng2_bs3_modal_1 = require('ng2-bs3-modal/ng2-bs3-modal');
var trigger_installer_component_1 = require('../../flogo.installer.trigger-installer/components/trigger-installer.component');
var activity_installer_component_1 = require('../../flogo.installer.activity-installer/components/activity-installer.component');
var search_component_1 = require('../../flogo.installer.search/components/search.component');
var url_installer_component_1 = require('../../flogo.installer.url-installer/components/url-installer.component');
var triggers_api_service_1 = require('../../../common/services/restapi/triggers-api.service');
var activities_api_service_1 = require('../../../common/services/restapi/activities-api.service');
var utils_1 = require('../../../common/utils');
var constants_1 = require('../constants');
var ACTIVITY_TITLE = 'Download Tiles';
var TRIGGER_TITLE = 'Download Triggers';
var FlogoInstallerComponent = (function () {
    function FlogoInstallerComponent(_router, _triggersAPIs, _activitiesAPIs) {
        this._router = _router;
        this._triggersAPIs = _triggersAPIs;
        this._activitiesAPIs = _activitiesAPIs;
        this.isActivatedUpdate = new core_1.EventEmitter();
        this.onInstalled = new core_1.EventEmitter();
        this._query = '';
        this._title = '';
        this._status = constants_1.FLOGO_INSTALLER_STATUS_IDLE;
        this.installTypeUpdate = new core_1.EventEmitter();
        this.init();
    }
    FlogoInstallerComponent.prototype.init = function () {
        console.log('Initialise Flogo Installer Component.');
        this._status = constants_1.FLOGO_INSTALLER_STATUS_STANDBY;
    };
    FlogoInstallerComponent.prototype.ngOnChanges = function (changes) {
        if (_.has(changes, 'installType')) {
            this.onInstallTypeChange(changes['installType'].currentValue);
        }
        if (_.has(changes, 'isActivated')) {
            this.onActivatedStatusChange(changes['isActivated'].currentValue);
        }
    };
    FlogoInstallerComponent.prototype.onInstallTypeChange = function (newVal) {
        this._installType = newVal;
        switch (this._installType) {
            case 'activity':
                this._title = ACTIVITY_TITLE;
                break;
            case 'trigger':
                this._title = TRIGGER_TITLE;
                break;
            default:
                this._title = 'Install';
                break;
        }
    };
    FlogoInstallerComponent.prototype.onActivatedStatusChange = function (newVal) {
        console.log("Changed in FlogoInstallerComponent: " + newVal);
        if (newVal !== this._isActivated) {
            console.log("Assigned.");
            this._isActivated = newVal;
            if (this._isActivated) {
                this.openModal();
            }
        }
    };
    FlogoInstallerComponent.prototype.openModal = function () {
        console.log('Open Modal.');
        this._status = constants_1.FLOGO_INSTALLER_STATUS_STANDBY;
        this.modal.open();
    };
    FlogoInstallerComponent.prototype.closeModal = function () {
        console.log('Close Modal.');
        this.modal.close();
    };
    FlogoInstallerComponent.prototype.onModalCloseOrDismiss = function () {
        console.log('On Modal Close.');
        this._isActivated = false;
        this._status = constants_1.FLOGO_INSTALLER_STATUS_IDLE;
        this.isActivatedUpdate.emit(false);
    };
    FlogoInstallerComponent.prototype.onInstallAction = function (url) {
        var _this = this;
        console.group("[FlogoInstallerComponent] onInstallAction");
        console.log("Source URL: " + url + " ");
        var installAPI = null;
        if (this._installType === 'trigger') {
            installAPI = this._triggersAPIs.installTriggers.bind(this._triggersAPIs);
        }
        else if (this._installType === 'activity') {
            installAPI = this._activitiesAPIs.installActivities.bind(this._activitiesAPIs);
        }
        else {
            console.warn('Unknown installation type.');
            console.groupEnd();
            return;
        }
        var self = this;
        if (_.isFunction(installAPI)) {
            self._status = constants_1.FLOGO_INSTALLER_STATUS_INSTALLING;
            installAPI([url])
                .then(function (response) {
                console.group("[FlogoInstallerComponent] onResponse");
                if (response.fail.length) {
                    utils_1.notification(_.capitalize(self._installType) + " installation failed.", 'error');
                    console.error(_.capitalize(self._installType) + " [ " + url + " ] installation failed.");
                }
                else {
                    utils_1.notification(_.capitalize(self._installType) + " installed.", 'success', 3000);
                    console.log(_.capitalize(self._installType) + " [ " + url + " ] installed.");
                }
                console.groupEnd();
                return response;
            })
                .then(function (response) {
                _this.onInstalled.emit(response);
                self._status = constants_1.FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS;
                console.groupEnd();
                return response;
            })
                .catch(function (err) {
                console.error(err);
                utils_1.notification(_.capitalize(self._installType) + " installation failed.", 'error');
                self._status = constants_1.FLOGO_INSTALLER_STATUS_INSTALL_FAILED;
                console.groupEnd();
            });
        }
        else {
            self._status = constants_1.FLOGO_INSTALLER_STATUS_INSTALL_FAILED;
        }
    };
    __decorate([
        core_1.ViewChild('installerModal'), 
        __metadata('design:type', ng2_bs3_modal_1.ModalComponent)
    ], FlogoInstallerComponent.prototype, "modal", void 0);
    FlogoInstallerComponent = __decorate([
        core_1.Component({
            selector: 'flogo-installer',
            moduleId: module.id,
            directives: [
                ng2_bs3_modal_1.MODAL_DIRECTIVES,
                search_component_1.FlogoInstallerSearchComponent,
                category_selector_component_1.FlogoInstallerCategorySelectorComponent,
                activity_installer_component_1.FlogoInstallerActivityComponent,
                trigger_installer_component_1.FlogoInstallerTriggerComponent,
                url_installer_component_1.FlogoInstallerUrlComponent
            ],
            template: "<modal [size]=\"'lg'\" #installerModal (onClose)=\"onModalCloseOrDismiss($event)\"        (onDismiss)=\"onModalCloseOrDismiss($event)\">   <modal-body>     <i class=\"flogo-installer-modal-close\" (click)=\"closeModal()\"></i>     <header class=\"container-fluid\">       <div class=\"row\">         <div class=\"col-md-8\">           <h3 class=\"flogo-installer-modal-title\" [innerHtml]=\"_title\"></h3>         </div>         <div class=\"col-md-4\">           <flogo-installer-search [(flogoSearchQuery)]=\"query\"></flogo-installer-search>         </div>       </div>       <hr class=\"flogo-installer-modal-hr\"/>     </header>      <section class=\"container-fluid\">       <flogo-installer-activity *ngIf=\"_installType=='activity'\" [flogoSearchQuery]=\"query\"                                 [flogoInstallerStatus]=\"_status\"></flogo-installer-activity>       <flogo-installer-trigger *ngIf=\"_installType=='trigger'\" [flogoSearchQuery]=\"query\"                                [flogoInstallerStatus]=\"_status\"></flogo-installer-trigger>     </section>      <hr/>      <section class=\"container-fluid\">       <div class=\"row\">         <div class=\"col-md-offset-4 col-md-8\">           <flogo-installer-url [flogoInstallType]=\"_installType\"                                (flogoOnInstall)=\"onInstallAction($event)\"                                [flogoInstallerStatus]=\"_status\"></flogo-installer-url>         </div>       </div>     </section>   </modal-body> </modal>",
            inputs: ['installType: flogoInstallType', 'isActivated: flogoIsActivated'],
            outputs: [
                'installTypeUpdate: flogoInstallTypeChange',
                'isActivatedUpdate: flogoIsActivatedChange',
                'onInstalled: flogoOnInstalled'
            ],
            styles: [":host {   display: block;   margin: 0;   padding: 0; } .flogo-installer-modal-title {   font-size: 24px;   line-height: 43px;   font-family: 'Source Sans Pro', 'Helvetica', 'Arial', sans-serif;   color: #8E9AA8;   margin: 0;   padding: 0; } .flogo-installer-modal-close {   position: fixed;   top: 20px;   right: 20px;   height: 20px;   width: 20px;   background: #FFF url('/assets/svg/flogo.close.svg') no-repeat center center;   cursor: pointer; } .flogo-installer-modal-hr {   margin-top: 10px;   margin-bottom: 10px; }"]
        }), 
        __metadata('design:paramtypes', [router_deprecated_1.Router, triggers_api_service_1.RESTAPITriggersService, activities_api_service_1.RESTAPIActivitiesService])
    ], FlogoInstallerComponent);
    return FlogoInstallerComponent;
}());
exports.FlogoInstallerComponent = FlogoInstallerComponent;
