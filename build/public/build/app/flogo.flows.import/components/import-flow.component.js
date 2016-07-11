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
var flows_api_service_1 = require('../../../common/services/restapi/flows-api.service');
var FlogoFlowsImport = (function () {
    function FlogoFlowsImport(elementRef, _flowsAPIs) {
        this._flowsAPIs = _flowsAPIs;
        this._elmRef = elementRef;
        this.onError = new core_1.EventEmitter();
        this.onSuccess = new core_1.EventEmitter();
    }
    FlogoFlowsImport.prototype.selectFile = function (evt) {
        var fileElm = jQuery(this._elmRef.nativeElement)
            .find('.flogo-flows-import-input-file');
        try {
            fileElm.val('');
        }
        catch (err) {
            console.error(err);
        }
    };
    FlogoFlowsImport.prototype.onFileChange = function (evt) {
        var _this = this;
        var importFile = _.get(evt, 'target.files[0]');
        if (_.isUndefined(importFile)) {
            console.error('Invalid file to import');
        }
        else {
            this._flowsAPIs.importFlow(importFile)
                .then(function (result) {
                _this.onSuccess.emit(result);
            })
                .catch(function (err) {
                console.error(err);
                _this.onError.emit(err);
            });
        }
    };
    FlogoFlowsImport = __decorate([
        core_1.Component({
            selector: 'flogo-flows-import',
            moduleId: module.id,
            template: "<label class=\"flogo-flows-import-label\" (click)=\"selectFile($event)\">   <i class=\"fa fa-cloud-upload\"></i>Import a flow   <input class=\"flogo-flows-import-input-file\" type=\"file\" accept=\"application/json\" hidden (change)=\"onFileChange($event)\" name=\"importFile\"> </label>",
            styles: [":host {   display: inline-block;   position: relative;   float: right;   height: 35px;   line-height: 35px;   margin: 24px; } :host :hover {   color: #0081CB; } .flogo-flows-import-input-file {   display: none; } .flogo-flows-import-label {   cursor: pointer;   padding-left: 23px;   transition: color 200ms ease-in-out; } .flogo-flows-import-label > .fa {   font-size: 18px;   position: absolute;   left: 0;   bottom: 8px; }"],
            outputs: ['onError:importError', 'onSuccess:importSuccess']
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, flows_api_service_1.RESTAPIFlowsService])
    ], FlogoFlowsImport);
    return FlogoFlowsImport;
}());
exports.FlogoFlowsImport = FlogoFlowsImport;
