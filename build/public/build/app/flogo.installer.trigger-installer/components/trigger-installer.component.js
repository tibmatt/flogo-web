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
var category_selector_component_1 = require('../../flogo.installer.category-selector/components/category-selector.component');
var list_view_component_1 = require('../../flogo.installer.list-view/components/list-view.component');
var base_installer_component_1 = require('../../flogo.installer.base-installer/components/base-installer.component');
var triggers_api_service_1 = require('../../../common/services/restapi/triggers-api.service');
var constants_1 = require('../../flogo.installer/constants');
var FlogoInstallerTriggerComponent = (function (_super) {
    __extends(FlogoInstallerTriggerComponent, _super);
    function FlogoInstallerTriggerComponent(_restAPITriggersService) {
        _super.call(this);
        this._restAPITriggersService = _restAPITriggersService;
        this.init();
    }
    FlogoInstallerTriggerComponent.prototype.getInstallables = function () {
        return this._restAPITriggersService.getTriggers()
            .then(function (triggers) {
            return _.map(triggers, function (trigger) {
                return {
                    name: trigger.name,
                    title: trigger.title,
                    description: trigger.description,
                    version: trigger.version,
                    where: trigger.where,
                    icon: trigger.icon,
                    author: trigger.author,
                    createTime: trigger.createTime || Date.now(),
                    updateTime: trigger.updateTime || Date.now(),
                    isInstalled: trigger.installed || false
                };
            });
        });
    };
    FlogoInstallerTriggerComponent.prototype.onInstallerStatusChange = function (status) {
        if (status === constants_1.FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS || status === constants_1.FLOGO_INSTALLER_STATUS_INSTALL_FAILED) {
            this.updateData();
        }
    };
    FlogoInstallerTriggerComponent = __decorate([
        core_1.Component({
            selector: 'flogo-installer-trigger',
            moduleId: module.id,
            directives: [
                category_selector_component_1.FlogoInstallerCategorySelectorComponent,
                list_view_component_1.FlogoInstallerListViewComponent
            ],
            template: "<div class=\"row\">   <div class=\"col-md-4\">     <flogo-installer-category-selector [flogoCategories]=\"_categories\"                                        (flogoOnCategorySelected)=\"onCategorySelected($event)\"></flogo-installer-category-selector>   </div>   <div class=\"col-md-8\">     <flogo-installer-list-view [flogoInstallables]=\"_installables\"                                (flogoOnItemAction)=\"onItemAction($event)\"></flogo-installer-list-view>   </div> </div>",
            inputs: ['query: flogoSearchQuery', 'status: flogoInstallerStatus'],
            styles: [":host {   display: block;   margin: 0;   padding: 0; }"]
        }), 
        __metadata('design:paramtypes', [triggers_api_service_1.RESTAPITriggersService])
    ], FlogoInstallerTriggerComponent);
    return FlogoInstallerTriggerComponent;
}(base_installer_component_1.FlogoInstallerBaseComponent));
exports.FlogoInstallerTriggerComponent = FlogoInstallerTriggerComponent;
