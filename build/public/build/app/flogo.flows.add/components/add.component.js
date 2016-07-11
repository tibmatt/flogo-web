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
var post_service_1 = require('../../../common/services/post.service');
var message_1 = require('../message');
var ng2_bs3_modal_1 = require('ng2-bs3-modal/ng2-bs3-modal');
var FlogoFlowsAdd = (function () {
    function FlogoFlowsAdd(_postService) {
        this._postService = _postService;
        this.flowInfo = {};
        this._sending = true;
    }
    FlogoFlowsAdd.prototype.sendAddFlowMsg = function () {
        if (this._sending) {
            this._sending = false;
            this._postService.publish(_.assign({}, message_1.PUB_EVENTS.addFlow, { data: this.flowInfo }));
            this.closeAddFlowModal();
        }
        else {
        }
    };
    FlogoFlowsAdd.prototype.closeAddFlowModal = function () {
        this.flowInfo = {};
        this.modal.close();
        this._sending = true;
    };
    __decorate([
        core_1.ViewChild('modal'), 
        __metadata('design:type', ng2_bs3_modal_1.ModalComponent)
    ], FlogoFlowsAdd.prototype, "modal", void 0);
    FlogoFlowsAdd = __decorate([
        core_1.Component({
            selector: 'flogo-flows-add',
            moduleId: module.id,
            template: "<button class=\"flogo-flows-container-box-add btn btn-default\" (click)=\"modal.open()\">     New flow </button>  <modal [size]=\"'sm'\" #modal>     <modal-header><h3>Create new flow</h3></modal-header>     <modal-body>         <div class=\"form-group\">             <label for=\"flowName\" class=\"h4\">Flow name</label>             <input type=\"text\" [(ngModel)]=\"flowInfo.name\" class=\"form-control\" id=\"flowName\" placeholder=\"Give your flow a name\">         </div>         <div class=\"form-group\">             <label for=\"flowDescription\" class=\"h4\">Flow description</label>             <textarea class=\"form-control\" [(ngModel)]=\"flowInfo.description\" rows=\"3\" id=\"flowDescription\" placeholder=\"Add a description of your flow\"></textarea>         </div>     </modal-body>     <modal-footer>         <button type=\"button\" class=\"flogo-flows-add-cancel\" data-dismiss=\"modal\" (click)=\"closeAddFlowModal()\">CANCEL</button>         <button type=\"button\" class=\"flogo-flows-add-save\" [ngClass]=\"{allowed: flowInfo.name}\"                 (click)=\"flowInfo.name&&sendAddFlowMsg()\">SAVE</button>     </modal-footer> </modal>",
            styles: [":host {   display: inline-block;   position: relative;   float: right;   margin: 24px 0; } :host :hover {   color: #0081CB; } .flogo-flows-container-box-add {   top: -5px;   right: 0;   height: 35px;   width: 46px;   padding: 0;   overflow: hidden;   text-indent: 43px;   border-radius: 5px;   background: rgba(255, 255, 255, 0.9) url(\"/assets/svg/flogo.flows.add.btn.svg\") no-repeat -2px center;   border: solid 2px #d8d8d8;   font-size: 12px;   color: #727272;   cursor: pointer;   white-space: nowrap;   transition: width 500ms linear, text-indent 500ms linear; } .flogo-flows-container-box-add:hover {   width: 112px;   text-indent: 36px; } .flogo-flows-container-box-add:active {   color: #fff;   border: #79b8dc;   background: #79b8dc url(\"/assets/svg/flogo.flows.add.btn.selected.svg\") no-repeat -2px center; } .flogo-flows-add-save, .flogo-flows-add-cancel {   width: 122px;   height: 45px;   font-size: 16px; } .flogo-flows-add-cancel {   border: solid 2px #0081cb;   background: #fff;   color: #0081cb; } .flogo-flows-add-cancel:hover {   border-radius: 4px; } .flogo-flows-add-cancel:active {   color: #fff;   border-radius: 4px;   background-color: #062e79;   border: solid 2px #062e79; } .flogo-flows-add-save {   background-color: rgba(0, 129, 203, 0.5);   border: none;   color: #fff;   cursor: not-allowed; } .flogo-flows-add-save.allowed {   cursor: pointer;   opacity: 1;   background-color: #0081cb; } .flogo-flows-add-save.allowed:hover {   border-radius: 4px;   background-color: #0081cb; } .flogo-flows-add-save.allowed:active {   color: #fff;   border-radius: 4px;   background-color: #062e79;   border: solid 2px #062e79; }"],
            directives: [ng2_bs3_modal_1.MODAL_DIRECTIVES]
        }), 
        __metadata('design:paramtypes', [post_service_1.PostService])
    ], FlogoFlowsAdd);
    return FlogoFlowsAdd;
}());
exports.FlogoFlowsAdd = FlogoFlowsAdd;
