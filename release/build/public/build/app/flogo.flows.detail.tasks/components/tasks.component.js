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
var install_component_1 = require('../../flogo.flows.detail.tasks.install/components/install.component');
var activities_api_service_1 = require('../../../common/services/restapi/activities-api.service');
var FlogoFlowsDetailTasks = (function () {
    function FlogoFlowsDetailTasks(_postService, _routeParams, _restAPIActivitiesService) {
        this._postService = _postService;
        this._routeParams = _routeParams;
        this._restAPIActivitiesService = _restAPIActivitiesService;
        this.filteredTasks = [];
        this._filterQuery = null;
        this.tasks = [];
        console.group('Constructing FlogoFlowsDetailTasks');
        console.log(this._routeParams);
        this.initSubscribe();
        this._loadActivities();
        console.groupEnd();
    }
    FlogoFlowsDetailTasks.prototype.ngOnDestroy = function () {
        var _this = this;
        this._subscriptions.forEach(function (sub) {
            _this._postService.unsubscribe(sub);
        });
    };
    Object.defineProperty(FlogoFlowsDetailTasks.prototype, "filterQuery", {
        get: function () {
            return this._filterQuery;
        },
        set: function (query) {
            this._filterQuery = query;
            this._filterActivities();
        },
        enumerable: true,
        configurable: true
    });
    FlogoFlowsDetailTasks.prototype.sendAddTaskMsg = function (task) {
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.addTask, {
            data: _.assign({}, this._addTaskMsg, {
                task: _.assign({}, task)
            })
        }));
    };
    FlogoFlowsDetailTasks.prototype.initSubscribe = function () {
        var _this = this;
        this._subscriptions = [];
        var subs = [
            _.assign({}, messages_1.SUB_EVENTS.addTask, { callback: this._getAddTaskMsg.bind(this) }),
            _.assign({}, messages_1.SUB_EVENTS.installActivity, { callback: this._loadActivities.bind(this) }),
        ];
        _.each(subs, function (sub) {
            _this._subscriptions.push(_this._postService.subscribe(sub));
        });
    };
    FlogoFlowsDetailTasks.prototype._loadActivities = function () {
        var _this = this;
        console.log('Loading activities');
        this._restAPIActivitiesService.getActivities()
            .then(function (tasks) {
            _this.tasks = tasks;
            _this._filterActivities();
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    FlogoFlowsDetailTasks.prototype._getAddTaskMsg = function (data, envelope) {
        console.group('Add task message in tasks');
        console.log(data);
        console.log(envelope);
        this._addTaskMsg = data;
        console.groupEnd();
    };
    FlogoFlowsDetailTasks.prototype._filterActivities = function () {
        if (this.filterQuery) {
            var filterQuery_1 = this.filterQuery.toLowerCase();
            this.filteredTasks = _.filter(this.tasks, function (task) { return task.name.toLowerCase().indexOf(filterQuery_1) >= 0; });
        }
        else {
            this.filteredTasks = this.tasks;
        }
    };
    FlogoFlowsDetailTasks.prototype.onInstalledAction = function (response) {
        console.group("[FlogoFlowsDetailTasks] onInstalled");
        console.log(response);
        console.groupEnd();
        this._loadActivities();
    };
    FlogoFlowsDetailTasks = __decorate([
        core_1.Component({
            selector: 'flogo-flows-detail-tasks',
            moduleId: module.id,
            directives: [install_component_1.FlogoFlowsDetailTasksInstallComponent],
            template: "<div class=\"flogo-common-edit-panel\">    <div class=\"flogo-common-edit-panel__head\">     <div class=\"flogo-common-edit-panel__head-wrapper\">       <h3 class=\"flogo-common-edit-panel__head-title\">Add Activity</h3>       <div class=\"flogo-common-edit-panel__head-subtitle\"></div>     </div>   </div>    <div class=\"filter-box\">     <input class=\"flogo-input-search filter-box__input\" type=\"text\" [(ngModel)]=\"filterQuery\" placeholder=\"Filter tasks\">   </div>    <flogo-flows-detail-tasks-install     (flogoOnInstalled)=\"onInstalledAction($event)\"></flogo-flows-detail-tasks-install>    <ul class=\"flogo-common-edit-panel__tiles-list\">     <li class=\"flogo-common-edit-panel__tiles-list-tile\" *ngFor=\"let task of filteredTasks\"         (click)=\"sendAddTaskMsg(task)\">{{task.name}}     </li>   </ul> </div>",
            styles: [".filter-box {   margin: 19px 21px; } .filter-box__input {   width: 100%; } .flogo-common-edit-panel__head {   background-color: #fe883b;   padding-top: 33px; } .flogo-common-edit-panel__head-title:before {   content: \"\";   background: #fff url(\"/assets/svg/flogo.flows.detail.add.cross.icon.svg\") center center / 50% no-repeat;   width: 40px;   height: 40px;   border-radius: 50%;   display: inline-block;   margin-right: 15px;   text-align: center;   vertical-align: middle; }"]
        }), 
        __metadata('design:paramtypes', [post_service_1.PostService, router_deprecated_1.RouteParams, activities_api_service_1.RESTAPIActivitiesService])
    ], FlogoFlowsDetailTasks);
    return FlogoFlowsDetailTasks;
}());
exports.FlogoFlowsDetailTasks = FlogoFlowsDetailTasks;
