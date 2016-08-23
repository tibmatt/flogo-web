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
var flows_api_service_1 = require('../../../common/services/restapi/flows-api.service');
var activities_api_service_1 = require('../../../common/services/restapi/activities-api.service');
var triggers_api_service_1 = require('../../../common/services/restapi/triggers-api.service');
var utils_1 = require('../../../common/utils');
var add_component_1 = require('../../flogo.flows.add/components/add.component');
var post_service_1 = require('../../../common/services/post.service');
var message_1 = require('../../flogo.flows.add/message');
var modal_service_1 = require('../../../common/services/modal.service');
var import_flow_component_1 = require('../../flogo.flows.import/components/import-flow.component');
var configurationLoaded_service_1 = require('../../../common/services/configurationLoaded.service');
var FlogoFlowsComponet = (function () {
    function FlogoFlowsComponet(_flow, _postService, _flogoModal, _router) {
        this._flow = _flow;
        this._postService = _postService;
        this._flogoModal = _flogoModal;
        this._router = _router;
        this.flows = [];
        this.getAllFlows();
        this.initSubscribe();
    }
    FlogoFlowsComponet.prototype.initSubscribe = function () {
        this._sub = this._postService.subscribe(_.assign({}, message_1.PUB_EVENTS.addFlow, {
            callback: this._addFlowMsg.bind(this)
        }));
    };
    FlogoFlowsComponet.prototype.ngOnDestroy = function () {
        this._postService.unsubscribe(this._sub);
    };
    FlogoFlowsComponet.prototype._addFlowMsg = function (data) {
        var _this = this;
        new Promise(function (resolve, reject) {
            var request = {
                name: data.name,
                description: data.description,
                paths: {},
                items: {}
            };
            _this._flow.createFlow(_.clone(request)).then(function (response) {
                utils_1.notification('Flow was created successfully!', 'success', 3000);
                resolve(response);
            }).catch(function (err) {
                utils_1.notification("Create flow error: " + err, 'error');
                reject(err);
            });
        }).then(function () {
            return _this.getAllFlows();
        }).catch(function (err) {
            console.error(err);
        });
    };
    FlogoFlowsComponet.prototype.openFlow = function (flowId, evt) {
        if (_.isFunction(_.get(evt, 'stopPropagation'))) {
            evt.stopPropagation();
        }
        this._router.navigate([
            'FlogoFlowDetail',
            { id: utils_1.flogoIDEncode(flowId) }
        ])
            .catch(function (err) {
            console.error(err);
        });
    };
    FlogoFlowsComponet.prototype.deleteFlow = function (flow, evt) {
        var _this = this;
        if (_.isFunction(_.get(evt, 'stopPropagation'))) {
            evt.stopPropagation();
        }
        this._flogoModal.confirmDelete('Are you sure you want to delete ' + flow.name + ' flow?').then(function (res) {
            if (res) {
                _this._flow.deleteFlow(flow._id, flow._rev).then(function () {
                    _this.getAllFlows();
                    utils_1.notification('Flow was deleted successfully!', 'success', 3000);
                }).catch(function (err) {
                    utils_1.notification("Remove flow error: " + err, 'error');
                });
            }
            else {
            }
        });
    };
    FlogoFlowsComponet.prototype.getAllFlows = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._flow.getFlows().then(function (response) {
                if (typeof response !== 'object') {
                    response = JSON.parse(response);
                }
                response.reverse();
                _this.flows = response;
                _this.flows.forEach(function (flow) {
                    var time = new Date(flow.created_at);
                    time = new Date(time.getTime());
                    var timeStr = '' + time.getFullYear() + _this._toDouble(time.getMonth() + 1) + _this._toDouble(time.getDate()) + ' ' + _this._toDouble(time.getHours()) + ':' + _this._toDouble(time.getMinutes()) + ':' + _this._toDouble(time.getSeconds());
                    flow.created_at = moment(timeStr, 'YYYYMMDD hh:mm:ss').fromNow();
                });
                resolve(response);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    FlogoFlowsComponet.prototype.onFlowImportSuccess = function (result) {
        utils_1.notification("Import flow successfully!", 'success', 3000);
        this.getAllFlows();
    };
    FlogoFlowsComponet.prototype.onFlowImportError = function (err) {
        utils_1.notification("" + err.response, 'error');
    };
    FlogoFlowsComponet.prototype.flogoIDEncode = function (id) {
        return utils_1.flogoIDEncode(id);
    };
    FlogoFlowsComponet.prototype._toDouble = function (num) {
        return num > 9 ? num : '0' + num;
    };
    FlogoFlowsComponet = __decorate([
        core_1.Component({
            selector: 'flogo-flows',
            moduleId: module.id,
            template: "<div class=\"flogo-flows-container\">   <div class=\"flogo-flows-container-header\">     <div class=\"container-fluid\">       <div class=\"flogo-flows-container-header-container\">         <h3 class=\"flogo-flows-container-title\">My Flows</h3>         <flogo-flows-add></flogo-flows-add>         <flogo-flows-import           (importSuccess)=\"onFlowImportSuccess($event)\"           (importError)=\"onFlowImportError($event)\"></flogo-flows-import>         </div>     </div>    </div>   <div class=\"flogo-flows-container-body container-fluid\">     <ul class=\"flogo-flows-container-lists row\">       <li *ngFor=\"let flow of flows\" class=\"flogo-flows-container-list-col col-lg-4 col-sm-6 col-xs-12\">         <div class=\"flogo-flows-container-list\">           <a class=\"flogo-flows-container-list-detail\" href=\"javascript:void(0);\" (click)=\"openFlow(flow._id, $event)\">             <header class=\"flogo-flows-container-list-detail-name\" [title]=\"flow.name\">{{flow.name}}</header>             <section class=\"flogo-flows-container-list-detail-info\">               <p class=\"flogo-flows-container-list-detail-description\" [title]=\"flow.description\">{{flow.description}}</p>               <i class=\"flogo-flows-container-list-detail-creatTime\">Created {{flow.created_at}}</i>             </section>           </a>           <span class=\"flogo-flows-container-list-detail-trash\" (click)=\"deleteFlow(flow, $event)\"></span>         </div>       </li>     </ul>   </div> </div>",
            styles: [":host {   display: flex;   flex: auto; } .flogo-flows-container {   background: #eeeded;   width: 100%; } .flogo-flows-container-title {   display: inline-block;   line-height: 35px;   color: #666; } .flogo-flows-container-header {   height: 136px;   padding-top: 30px;   background: #fafafa; } .flogo-flows-container-header-container {   width: 90%;   margin: 0 auto; } .flogo-flows-container-header-detail {   position: relative;   margin: 0 auto;   width: 560px; } .flogo-flows-container-lists {   margin: 0 auto;   padding: 30px 0 0;   width: 90%;   display: flex;   flex-wrap: wrap;   justify-content: flex-start; } .flogo-flows-container-lists .flogo-flows-container-list {   display: flex;   margin: 20px 20px;   border-radius: 4px;   list-style: none;   background-color: #ffffff;   box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.3);   /*width: @card-width;*/   height: 160px;   position: relative; } .flogo-flows-container-lists .flogo-flows-container-list:hover {   background-color: #ececec; } .flogo-flows-container-lists .flogo-flows-container-list:hover .flogo-flows-container-list-detail-trash {   opacity: 1; } .flogo-flows-container-lists .flogo-flows-container-list:hover .flogo-flows-container-list-detail-description:before {   background: #ececec; } .flogo-flows-container-lists .flogo-flows-container-list-detail {   flex: auto;   color: #666;   width: 100%;   padding: 18px;   display: block;   text-decoration: none; } .flogo-flows-container-lists .flogo-flows-container-list-detail-trash {   display: inline-block;   opacity: 0;   width: 30px;   height: 30px;   cursor: pointer;   line-height: 100%;   background: url(\"/assets/svg/flogo.flows.trash.icon.svg\") center no-repeat;   background-size: 16px;   position: absolute;   top: 10px;   right: 10px; } .flogo-flows-container-lists .flogo-flows-container-list-detail-trash:hover {   background: url(\"/assets/svg/flogo.flows.trash.hover.icon.svg\") center no-repeat;   background-size: 16px; } .flogo-flows-container-lists .flogo-flows-container-list-detail-name {   display: block;   margin-bottom: 3px;   font-size: 18px;   letter-spacing: 0.4px;   line-height: 18px;   white-space: nowrap;   overflow: hidden;   text-overflow: ellipsis;   padding-right: 25px; } .flogo-flows-container-lists .flogo-flows-container-list-detail-info {   display: block;   line-height: 13px;   font-size: 10px;   letter-spacing: 0.6px; } .flogo-flows-container-lists .flogo-flows-container-list-detail-creatTime {   display: inline-block;   vertical-align: middle;   width: 100%;   text-align: right;   position: absolute;   bottom: 15px;   right: 15px; } .flogo-flows-container-lists .flogo-flows-container-list-detail-description {   display: inline-block;   vertical-align: middle;   width: 100%;   margin-top: 10px;   font-size: 14px;   line-height: 1.2;   max-height: 4.8em;   overflow: hidden;   position: relative; } .flogo-flows-container-lists .flogo-flows-container-list-detail-description:before {   position: absolute;   content: '';   width: 100%;   height: 1.2em;   top: 3.6em;   left: 0;   background: #ffffff; } .flogo-flows-container-lists .flogo-flows-container-list-detail-description:after {   content: '...';   display: inline-block;   width: 3em;   height: 1.2em;   position: absolute;   top: 3.6em;   left: 0; } .flogo-flows-container-list-col {   margin: 0;   padding: 0;   list-style: none; } /* .flogo-calc-cards-container-width(1); .flogo-calc-cards-container-width(2); .flogo-calc-cards-container-width(3); .flogo-calc-cards-container-width(4); .flogo-calc-cards-container-width(5); */"],
            directives: [router_deprecated_1.ROUTER_DIRECTIVES, add_component_1.FlogoFlowsAdd, import_flow_component_1.FlogoFlowsImport],
            providers: [flows_api_service_1.RESTAPIFlowsService, activities_api_service_1.RESTAPIActivitiesService, triggers_api_service_1.RESTAPITriggersService, modal_service_1.FlogoModal]
        }),
        router_deprecated_1.CanActivate(function (next) {
            return configurationLoaded_service_1.isConfigurationLoaded();
        }), 
        __metadata('design:paramtypes', [flows_api_service_1.RESTAPIFlowsService, post_service_1.PostService, modal_service_1.FlogoModal, router_deprecated_1.Router])
    ], FlogoFlowsComponet);
    return FlogoFlowsComponet;
}());
exports.FlogoFlowsComponet = FlogoFlowsComponet;
