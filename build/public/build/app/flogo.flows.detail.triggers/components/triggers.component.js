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
var messages_1 = require('../messages');
var router_deprecated_1 = require('@angular/router-deprecated');
var install_component_1 = require('../../flogo.flows.detail.triggers.install/components/install.component');
var triggers_api_service_1 = require('../../../common/services/restapi/triggers-api.service');
var FlogoFlowsDetailTriggers = (function () {
    function FlogoFlowsDetailTriggers(_postService, _routeParams, _restAPITriggersService) {
        this._postService = _postService;
        this._routeParams = _routeParams;
        this._restAPITriggersService = _restAPITriggersService;
        console.group('Constructing FlogoFlowsDetailTasks');
        console.log(this._routeParams);
        this.initSubscribe();
        this._loadTriggers();
        console.groupEnd();
    }
    FlogoFlowsDetailTriggers.prototype.initSubscribe = function () {
        var _this = this;
        this._subscriptions = [];
        var subs = [
            _.assign({}, messages_1.SUB_EVENTS.addTrigger, { callback: this._getAddTriggerMsg.bind(this) }),
            _.assign({}, messages_1.SUB_EVENTS.selectTrigger, { callback: this._getSelectTriggerMsg.bind(this) })
        ];
        _.each(subs, function (sub) {
            _this._subscriptions.push(_this._postService.subscribe(sub));
        });
    };
    FlogoFlowsDetailTriggers.prototype.ngOnDestroy = function () {
        var _this = this;
        this._subscriptions.forEach(function (sub) {
            _this._postService.unsubscribe(sub);
        });
    };
    FlogoFlowsDetailTriggers.prototype._getAddTriggerMsg = function (data, envelope) {
        console.group('Add trigger message in triggers');
        console.log(data);
        console.log(envelope);
        this._addTriggerMsg = data;
        console.groupEnd();
    };
    FlogoFlowsDetailTriggers.prototype._getSelectTriggerMsg = function (data, envelope) {
        console.group('Select trigger message in triggers');
        console.log(data);
        console.log(envelope);
        this._selectTriggerMsg = data;
        console.groupEnd();
    };
    FlogoFlowsDetailTriggers.prototype.sendAddTriggerMsg = function (trigger) {
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.addTrigger, {
            data: _.assign({}, this._addTriggerMsg, { trigger: _.cloneDeep(trigger) })
        }));
    };
    FlogoFlowsDetailTriggers.prototype._loadTriggers = function () {
        var _this = this;
        console.log('Loading triggers');
        this._restAPITriggersService.getTriggers()
            .then(function (triggers) {
            _this.triggers = triggers;
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    FlogoFlowsDetailTriggers = __decorate([
        core_1.Component({
            selector: 'flogo-flows-detail-triggers',
            moduleId: module.id,
            directives: [install_component_1.FlogoFlowsDetailTriggersInstallComponent],
            template: "<div class=\"flogo-common-edit-panel flogo-flows-detail-triggers\">    <div class=\"flogo-common-edit-panel__head\">     <div class=\"flogo-common-edit-panel__head-wrapper\">       <h3 class=\"flogo-common-edit-panel__head-title\">Add Trigger</h3>       <div class=\"flogo-common-edit-panel__head-subtitle\"></div>     </div>   </div>    <!-- Search -->    <flogo-flows-detail-triggers-install></flogo-flows-detail-triggers-install>    <ul class=\"flogo-common-edit-panel__tiles-list flogo-flows-detail-triggers__list\">       <li *ngFor=\"let trigger of triggers\" class=\"flogo-common-edit-panel__tiles-list-trigger flogo-flows-detail-triggers__list__item\"           (click)=\"sendAddTriggerMsg(trigger)\" >{{trigger.name}}</li>   </ul> </div>",
            styles: [".flogo-common-edit-panel__head {   padding-top: 33px;   background-color: #fe883b; } .flogo-common-edit-panel__head-title:before {   content: \"\";   background: #fff url(\"/assets/svg/flogo.flows.detail.add.cross.icon.svg\") center center / 50% no-repeat;   width: 40px;   height: 40px;   border-radius: 50%;   display: inline-block;   margin-right: 15px;   text-align: center;   float: left; }"]
        }), 
        __metadata('design:paramtypes', [post_service_1.PostService, router_deprecated_1.RouteParams, triggers_api_service_1.RESTAPITriggersService])
    ], FlogoFlowsDetailTriggers);
    return FlogoFlowsDetailTriggers;
}());
exports.FlogoFlowsDetailTriggers = FlogoFlowsDetailTriggers;
