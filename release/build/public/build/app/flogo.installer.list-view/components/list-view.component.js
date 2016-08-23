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
var item_component_1 = require('../../flogo.installer.list-view.item/components/item.component');
var FlogoInstallerListViewComponent = (function () {
    function FlogoInstallerListViewComponent() {
        this.itemAction = new core_1.EventEmitter();
        this.init();
    }
    FlogoInstallerListViewComponent.prototype.init = function () {
        console.log('Initialise Flogo Installer List View Component.');
    };
    FlogoInstallerListViewComponent.prototype.ngOnChanges = function (changes) {
        if (_.has(changes, 'installables')) {
            this.onInstallablesChange(changes['installables'].currentValue);
        }
    };
    FlogoInstallerListViewComponent.prototype.onInstallablesChange = function (newVal) {
        this._installables = newVal;
    };
    FlogoInstallerListViewComponent.prototype.onItemAction = function (info) {
        console.log(info);
        this.itemAction.emit(info);
    };
    FlogoInstallerListViewComponent = __decorate([
        core_1.Component({
            selector: 'flogo-installer-list-view',
            moduleId: module.id,
            directives: [item_component_1.FlogoInstallerListViewItemComponent],
            inputs: ['installables: flogoInstallables'],
            outputs: ['itemAction: flogoOnItemAction'],
            template: "<section class=\"row\">   <ul>     <li class=\"flogo-list-view-item\" *ngFor=\"let installable of _installables; let i = index\">       <flogo-installer-list-view-item [flogoItem]=\"installable\"                                       (flogoOnItemAction)=\"onItemAction($event)\"></flogo-installer-list-view-item>     </li>   </ul> </section>",
            styles: [":host {   display: block;   margin: 0;   padding: 0; } .flogo-list-view-item {   list-style: none;   margin: 0;   padding: 0; }"]
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoInstallerListViewComponent);
    return FlogoInstallerListViewComponent;
}());
exports.FlogoInstallerListViewComponent = FlogoInstallerListViewComponent;
