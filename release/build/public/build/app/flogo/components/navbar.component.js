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
var FlogoNavbarComponent = (function () {
    function FlogoNavbarComponent() {
    }
    FlogoNavbarComponent = __decorate([
        core_1.Component({
            selector: 'flogo-navbar',
            moduleId: module.id,
            template: "<nav>   <div class=\"flogo-header\"><a [routerLink]=\"['FlogoFlows']\"><img src=\"/assets/svg/flogo.logo.svg\" alt=\"\"/></a></div> </nav>",
            styles: [":host {   background-color: #062e79;   color: rgba(255, 255, 255, 0.87);   display: block;   width: 100%;   height: 48px;   padding: 0 16px;   box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);   position: relative; } .flogo-header {   display: inline;   font-size: 20px;   font-weight: normal;   letter-spacing: 0.1px;   line-height: 48px;   margin: 0; }"],
            directives: [router_deprecated_1.ROUTER_DIRECTIVES]
        }), 
        __metadata('design:paramtypes', [])
    ], FlogoNavbarComponent);
    return FlogoNavbarComponent;
}());
exports.FlogoNavbarComponent = FlogoNavbarComponent;
