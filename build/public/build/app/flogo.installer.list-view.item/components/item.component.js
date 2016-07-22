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
var FlogoInstallerListViewItemComponent = (function () {
    function FlogoInstallerListViewItemComponent() {
        this.onItemAction = new core_1.EventEmitter();
        this.init();
    }
    FlogoInstallerListViewItemComponent.prototype.init = function () {
        console.log('Initialise Flogo Installer List View Item Component.');
    };
    FlogoInstallerListViewItemComponent.prototype.ngOnChanges = function (changes) {
        if (_.has(changes, 'item')) {
            this.onInstallablesChange(changes['item'].currentValue);
        }
    };
    FlogoInstallerListViewItemComponent.prototype.onInstallablesChange = function (newVal) {
        this._item = itemToViewItem(newVal);
    };
    FlogoInstallerListViewItemComponent.prototype.onInstall = function () {
        console.log('On Install.');
        this.onItemAction.emit({
            action: 'install',
            item: this.item
        });
    };
    FlogoInstallerListViewItemComponent.prototype.onUninstall = function () {
        console.log('On Uninstall.');
        this.onItemAction.emit({
            action: 'uninstall',
            item: this.item
        });
    };
    FlogoInstallerListViewItemComponent = __decorate([
        core_1.Component({
            selector: 'flogo-installer-list-view-item',
            moduleId: module.id,
            directives: [],
            inputs: ['item: flogoItem'],
            outputs: ['onItemAction: flogoOnItemAction'],
            template: "<i class=\"flogo-installer-list-item-icon pull-left\"></i>  <section class=\"flogo-installer-list-item-info pull-left\">   <div class=\"flogo-installer-list-item-display-name\" [innerText]=\"_item.displayName\"></div>   <div class=\"flogo-installer-list-item-description\" [innerText]=\"_item.description\"></div> </section>  <i class=\"flogo-installer-list-item-status-icon-not-installed pull-right\" *ngIf=\"!_item.isInstalled\"    (click)=\"onInstall()\" title=\"Install\"></i> <i class=\"flogo-installer-list-item-status-icon-installed pull-right\" *ngIf=\"_item.isInstalled\" (click)=\"onUninstall()\"    title=\"Installed.\"></i>  <section class=\"flogo-installer-list-item-detail pull-right\">   <div class=\"flogo-installer-list-item-author\" [innerText]=\"_item.author\"></div>   <div class=\"flogo-installer-list-item-create-time\" [innerText]=\"_item.createTime\"></div> </section>  <span class=\"clearfix\"></span>",
            styles: [":host {   display: block;   margin: 20px 0 0;   padding: 0 15px 12px 25px;   font-family: 'Source Sans Pro', 'Helvetica', 'Arial', sans-serif;   color: #666666;   position: relative;   border-bottom: solid 1px #D8D8D8; } .flogo-installer-list-item-icon {   display: inline-block;   width: 30px;   height: 30px;   background: url('/assets/svg/flogo.icon.gears.svg') no-repeat center center;   background-size: 30px 30px;   position: relative;   top: 3px; } .flogo-installer-list-item-info {   vertical-align: top;   display: inline-block;   margin-left: 25px; } .flogo-installer-list-item-detail {   vertical-align: top;   display: inline-block;   text-align: right;   margin-left: 25px; } .flogo-installer-list-item-status-icon, .flogo-installer-list-item-status-icon-installed, .flogo-installer-list-item-status-icon-not-installed {   vertical-align: top;   display: inline-block;   width: 24px;   height: 24px;   cursor: pointer;   background-size: 24px;   margin-left: 25px; } .flogo-installer-list-item-status-icon-installed {   background: url('/assets/svg/flogo.icon.check.circle.grey.svg') no-repeat center center; } .flogo-installer-list-item-status-icon-not-installed {   background: url('/assets/svg/flogo.icon.download.svg') no-repeat center center; } .flogo-installer-list-item-display-name {   text-transform: uppercase;   font-weight: bold;   font-size: 14px; } .flogo-installer-list-item-description {   font-size: 12px; } .flogo-installer-list-item-author {   font-size: 11px; } .flogo-installer-list-item-create-time {   font-size: 11px; }"]
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoInstallerListViewItemComponent);
    return FlogoInstallerListViewItemComponent;
}());
exports.FlogoInstallerListViewItemComponent = FlogoInstallerListViewItemComponent;
function itemToViewItem(item) {
    var viewItem = {
        displayName: item.title || item.name,
        description: item.description,
        version: item.version,
        icon: '',
        author: "Created by " + item.author,
        createTime: moment(item.createTime)
            .fromNow(),
        isInstalled: item.isInstalled
    };
    return viewItem;
}
