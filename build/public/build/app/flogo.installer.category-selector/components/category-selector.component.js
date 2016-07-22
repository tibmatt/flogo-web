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
var FlogoInstallerCategorySelectorComponent = (function () {
    function FlogoInstallerCategorySelectorComponent() {
        this.categorySelected = new core_1.EventEmitter();
        this.init();
    }
    FlogoInstallerCategorySelectorComponent.prototype.init = function () {
        console.log('Initialise Flogo Installer Category Selector Component.');
    };
    FlogoInstallerCategorySelectorComponent.prototype.ngOnChanges = function (changes) {
        if (_.has(changes, 'categories')) {
            this.onCategoriesChange(changes['categories'].currentValue);
        }
    };
    FlogoInstallerCategorySelectorComponent.prototype.onCategoriesChange = function (newValue) {
        console.log('onCategoriesChange');
        console.log(newValue);
    };
    FlogoInstallerCategorySelectorComponent.prototype.onCategorySelected = function (categoryName) {
        this.categorySelected.emit(categoryName);
    };
    FlogoInstallerCategorySelectorComponent = __decorate([
        core_1.Component({
            selector: 'flogo-installer-category-selector',
            moduleId: module.id,
            directives: [],
            inputs: ['categories: flogoCategories'],
            outputs: ['categorySelected: flogoOnCategorySelected'],
            template: "<div class=\"flogo-category-selector-title\">Category</div> <ul class=\"list-unstyled flogo-category-selector-list\">   <li class=\"flogo-category-selector-category\" *ngFor=\"let categoryName of categories; let i = index\"       [innerHTML]=\"categoryName\" [title]=\"categoryName\"       (click)=\"onCategorySelected(categoryName)\"></li> </ul>",
            styles: [":host {   display: block;   margin: 0;   padding: 0;   font-family: 'Source Sans Pro', 'Helvetica', 'Arial', sans-serif; } .flogo-category-selector-category {   cursor: pointer; } .flogo-category-selector-title {   color: #0081CB;   text-transform: uppercase;   font-size: 16px; } .flogo-category-selector-list {   width: 100%; } .flogo-category-selector-category {   font-size: 14px;   color: #666666;   margin: 0;   padding: 0;   line-height: 30px;   width: 100%;   overflow: hidden;   text-overflow: ellipsis;   white-space: nowrap; }"]
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoInstallerCategorySelectorComponent);
    return FlogoInstallerCategorySelectorComponent;
}());
exports.FlogoInstallerCategorySelectorComponent = FlogoInstallerCategorySelectorComponent;
