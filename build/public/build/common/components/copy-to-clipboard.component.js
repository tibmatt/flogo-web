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
var utils_1 = require('../utils');
var CopyToClipboardComponent = (function () {
    function CopyToClipboardComponent() {
        this.copied = false;
    }
    CopyToClipboardComponent.prototype.copy = function () {
        var _this = this;
        if (utils_1.copyToClipboard(this.element)) {
            this.copied = true;
            setTimeout(function () { return _this.copied = false; }, 1200);
        }
    };
    Object.defineProperty(CopyToClipboardComponent.prototype, "text", {
        get: function () {
            return this.copied ? 'Copied to clipboard' : 'Copy';
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.Input(), 
        __metadata('design:type', HTMLElement)
    ], CopyToClipboardComponent.prototype, "element", void 0);
    CopyToClipboardComponent = __decorate([
        core_1.Component({
            selector: 'flogo-copy-to-clipboard',
            template: "<button class=\"tc-buttons tc-buttons-primary-call flogo-clipboard-button\"\n        (click)=\"copy()\" [ngClass]=\"{disabled: copied}\" >{{ text }}</button>"
        }), 
        __metadata('design:paramtypes', [])
    ], CopyToClipboardComponent);
    return CopyToClipboardComponent;
}());
exports.CopyToClipboardComponent = CopyToClipboardComponent;
