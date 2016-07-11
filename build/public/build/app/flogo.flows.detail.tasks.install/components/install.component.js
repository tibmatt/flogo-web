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
var ng2_bs3_modal_1 = require('ng2-bs3-modal/ng2-bs3-modal');
var messages_1 = require("../../flogo.flows.detail.tasks/messages");
var rest_api_service_1 = require("../../../common/services/rest-api.service");
var post_service_1 = require("../../../common/services/post.service");
var InstallComponent = (function () {
    function InstallComponent(_restApiService, _postService) {
        this._restApiService = _restApiService;
        this._postService = _postService;
        this.activities = [];
        this._loadActivities();
    }
    InstallComponent.prototype.install = function (activity) {
        var _this = this;
        this._restApiService.activities
            .install([{
                name: activity.name,
                version: activity.version
            }])
            .then(function () {
            _this._loadActivities();
            _this._postService.publish(_.assign({}, messages_1.SUB_EVENTS.installActivity, {
                data: {}
            }));
        });
    };
    InstallComponent.prototype._loadActivities = function () {
        var _this = this;
        this._restApiService.activities.getAll()
            .then(function (activities) { return _this.activities = activities; });
    };
    ;
    InstallComponent = __decorate([
        core_1.Component({
            selector: 'flogo-flows-detail-tasks-install',
            directives: [ng2_bs3_modal_1.MODAL_DIRECTIVES],
            moduleId: module.id,
            template: "<div>   <button type=\"button\" class=\"btn btn-link flogo-common-edit-panel__btn-download\"           (click)=\"modal.open()\">     Install new Activity   </button>    <modal [size]=\"'lg'\" #modal>     <modal-header [show-close]=\"true\">       <div class=\"row flogo-flows-detail-tasks-install-modal\">         <div class=\"col-md-7\">           <h3 class=\"modal-title\">Download Tiles</h3>         </div>         <div class=\"col-md-3\">           <input class=\"flogo-input-search\" type=\"text\" placeholder=\"Search\">         </div>       </div>     </modal-header>     <modal-body>       <div class=\"row flogo-flows-detail-tasks-install-modal flogo-flows-detail-tasks-install-modal__content\">         <div class=\"col-md-4\">           <h4 class=\"category-list__title\">Category</h4>           <ul class=\"list-unstyled category-list\">             <li class=\"category-list__category\">Requests</li>             <li class=\"category-list__category\">Optimizations</li>             <li class=\"category-list__category\">Connect to Devices</li>             <li class=\"category-list__category\">Framework Adaptors</li>             <li class=\"category-list__category\">Web Adaptors</li>           </ul>         </div>         <div class=\"col-md-8\">           <ul class=\"list-unstyled activities-list\">             <li *ngFor=\"let activity of activities\"                 class=\"activities-list__activity\" [ngClass]=\"{installed: activity.isInstalled}\"                 (click)=\"!activity.isInstalled && install(activity)\">                <div class=\"row\">                 <div class=\"col-md-2\"><i class=\"fa fa-gears\"></i></div>                 <div class=\"col-md-7\">{{activity.name}}</div>                 <div class=\"col-md-2\">                   <i class=\"fa fa-check-circle-o install-status-icon\" *ngIf=\"activity.isInstalled\"></i>                   <i class=\"fa fa-download install-status-icon\" *ngIf=\"!activity.isInstalled\"></i>                 </div>               </div>             </li>           </ul>         </div>       </div>     </modal-body>   </modal> </div>",
        }), 
        __metadata('design:paramtypes', [rest_api_service_1.RESTAPIService, post_service_1.PostService])
    ], InstallComponent);
    return InstallComponent;
}());
exports.InstallComponent = InstallComponent;
