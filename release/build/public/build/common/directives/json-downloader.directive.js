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
var JsonDownloader = (function () {
    function JsonDownloader(el) {
        this.el = el;
        this.generateObject = function () { return null; };
        this._el = el.nativeElement;
    }
    JsonDownloader.prototype.ngOnInit = function () {
        this._link = document.createElement('a');
        this._link.setAttribute('download', 'flow.json');
        this._link.style.display = 'none';
    };
    JsonDownloader.prototype.onClick = function () {
        var _this = this;
        this.generateObject()
            .then(function (result) {
            var jsonString = JSON.stringify(result);
            var dataString = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
            _this._link.setAttribute('href', dataString);
            _this._link.setAttribute('download', 'flow.json');
            _this._link.click();
        });
    };
    __decorate([
        core_1.Input('jsonDownloader'), 
        __metadata('design:type', Function)
    ], JsonDownloader.prototype, "generateObject", void 0);
    JsonDownloader = __decorate([
        core_1.Directive({
            selector: '[jsonDownloader]',
            host: {
                '(click)': 'onClick()',
            }
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], JsonDownloader);
    return JsonDownloader;
}());
exports.JsonDownloader = JsonDownloader;
