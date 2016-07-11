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
var form_builder_component_1 = require('../../flogo.form-builder/components/form-builder.component');
var FlogoFlowsDetailTasksDetail = (function () {
    function FlogoFlowsDetailTasksDetail(_postService, _routeParams) {
        this._postService = _postService;
        this._routeParams = _routeParams;
        console.group('Constructing FlogoFlowsDetailTasks');
        console.log(this._routeParams);
        this.initSubscribe();
        console.groupEnd();
    }
    FlogoFlowsDetailTasksDetail.prototype.initSubscribe = function () {
        var _this = this;
        this._subscriptions = [];
        var subs = [
            _.assign({}, messages_1.SUB_EVENTS.selectTask, { callback: this._getSelectTaskMsg.bind(this) })
        ];
        _.each(subs, function (sub) {
            _this._subscriptions.push(_this._postService.subscribe(sub));
        });
    };
    FlogoFlowsDetailTasksDetail.prototype.ngOnDestroy = function () {
        var _this = this;
        this._subscriptions.forEach(function (sub) {
            _this._postService.unsubscribe(sub);
        });
    };
    FlogoFlowsDetailTasksDetail.prototype._getSelectTaskMsg = function (data, envelope) {
        console.group('Select task message in tasks');
        console.log(data);
        console.log(envelope);
        this._selectTaskMsg = data;
        this._task = data.task;
        this._step = data.step;
        this._context = data.context;
        if (_.isFunction(envelope.done)) {
            envelope.done();
        }
        console.groupEnd();
    };
    FlogoFlowsDetailTasksDetail.prototype.sendSelectTaskMsg = function (task) {
        console.log('sendSelectTaskMsg');
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.selectTask, {
            data: _.assign({}, this._selectTaskMsg, { task: task })
        }));
    };
    FlogoFlowsDetailTasksDetail = __decorate([
        core_1.Component({
            selector: 'flogo-flows-detail-tasks-detail',
            moduleId: module.id,
            template: "<div>   <flogo-form-builder [task]=\"_task\" [step]=\"_step\" [context]=\"_context\"></flogo-form-builder> </div>",
            styles: [""],
            directives: [form_builder_component_1.FlogoFormBuilderComponent]
        }), 
        __metadata('design:paramtypes', [post_service_1.PostService, router_deprecated_1.RouteParams])
    ], FlogoFlowsDetailTasksDetail);
    return FlogoFlowsDetailTasksDetail;
}());
exports.FlogoFlowsDetailTasksDetail = FlogoFlowsDetailTasksDetail;
