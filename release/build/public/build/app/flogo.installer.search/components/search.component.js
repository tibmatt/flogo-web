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
var PLACEHOLDER = 'SEARCH';
var FlogoInstallerSearchComponent = (function () {
    function FlogoInstallerSearchComponent() {
        this.placeholder = PLACEHOLDER;
        this._searchQuery = '';
        this.queryUpdate = new core_1.EventEmitter();
        this.init();
    }
    FlogoInstallerSearchComponent.prototype.init = function () {
    };
    FlogoInstallerSearchComponent.prototype.onSearchQueryChange = function (newQuery) {
        this._searchQuery = newQuery;
        this.queryUpdate.emit(this._searchQuery);
    };
    FlogoInstallerSearchComponent.prototype.ngOnChanges = function (changes) {
        if (_.has(changes, 'query')) {
            var currentValue = changes['query'].currentValue;
            if (currentValue !== this._searchQuery) {
                this._searchQuery = currentValue;
            }
        }
    };
    FlogoInstallerSearchComponent = __decorate([
        core_1.Component({
            selector: 'flogo-installer-search',
            moduleId: module.id,
            directives: [],
            template: "<input class=\"flogo-installer-search-input\" type=\"text\" [placeholder]=\"placeholder\" [ngModel]=\"_searchQuery\"        (ngModelChange)=\"onSearchQueryChange($event)\"/><i class=\"flogo-installer-search-icon\"></i>",
            inputs: ['query: flogoSearchQuery'],
            outputs: ['queryUpdate: flogoSearchQueryChange'],
            styles: [":host {   display: inline-block;   margin: 0;   padding: 0;   width: 100%; } .flogo-installer-search-input {   display: inline-block;   vertical-align: top;   padding: 10px 22px;   height: 43px;   width: -moz-calc(100% - 43px);   width: -webkit-calc(100% - 43px);   width: calc(100% - 43px);   font-family: 'Source Sans Pro', 'Helvetica', 'Arial', sans-serif;   font-size: 15px;   border: solid 1px #0081CB; } .flogo-installer-search-input:focus {   outline: none; } .flogo-installer-search-icon {   display: inline-block;   vertical-align: top;   background: #0081CB url('/assets/svg/flogo.icon.search.svg') no-repeat center center;   color: #FFF;   height: 43px;   width: 43px; }"]
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoInstallerSearchComponent);
    return FlogoInstallerSearchComponent;
}());
exports.FlogoInstallerSearchComponent = FlogoInstallerSearchComponent;
