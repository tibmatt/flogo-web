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
var navbar_component_1 = require('./navbar.component');
var flows_component_1 = require('../../flogo.flows/components/flows.component');
var canvas_component_1 = require('../../flogo.flows.detail/components/canvas.component');
var form_builder_component_1 = require("../../flogo.form-builder/components/form-builder.component");
var post_service_1 = require('../../../common/services/post.service');
var db_service_1 = require('../../../common/services/db.service');
var rest_api_service_1 = require('../../../common/services/rest-api.service');
var http_1 = require('@angular/http');
var rest_api_test_spec_1 = require('../../../common/services/rest-api-test.spec');
var flows_api_service_1 = require('../../../common/services/restapi/flows-api.service');
var activities_api_service_1 = require('../../../common/services/restapi/activities-api.service');
var triggers_api_service_1 = require('../../../common/services/restapi/triggers-api.service');
var config_component_1 = require('../../flogo.config/components/config.component');
var FlogoAppComponent = (function () {
    function FlogoAppComponent() {
    }
    FlogoAppComponent = __decorate([
        core_1.Component({
            selector: 'flogo-app',
            moduleId: module.id,
            template: "<flogo-navbar></flogo-navbar> <router-outlet></router-outlet>",
            styles: [":host {   display: flex;   align-items: stretch;   width: 100%;   flex-direction: column; }"],
            directives: [router_deprecated_1.ROUTER_DIRECTIVES, navbar_component_1.FlogoNavbarComponent],
            providers: [post_service_1.PostService, db_service_1.FlogoDBService, rest_api_service_1.RESTAPIService, flows_api_service_1.RESTAPIFlowsService, activities_api_service_1.RESTAPIActivitiesService, triggers_api_service_1.RESTAPITriggersService, http_1.HTTP_PROVIDERS]
        }),
        router_deprecated_1.RouteConfig([
            {
                path: '/', name: "FlogoHome", component: flows_component_1.FlogoFlowsComponet
            },
            {
                path: '/flows', name: "FlogoFlows", component: flows_component_1.FlogoFlowsComponet, useAsDefault: true
            },
            {
                path: '/flows/:id/...', name: "FlogoFlowDetail", component: canvas_component_1.FlogoCanvasComponent
            },
            {
                path: '/task', name: 'FlogoTask', component: form_builder_component_1.FlogoFormBuilderComponent
            },
            {
                path: '/rest-api-test', name: 'FlogoRESTAPITest', component: rest_api_test_spec_1.RESTAPITest
            },
            {
                path: '/_config', name: "FlogoDevConfig", component: config_component_1.FlogoConfigComponent
            },
        ]), 
        __metadata('design:paramtypes', [])
    ], FlogoAppComponent);
    return FlogoAppComponent;
}());
exports.FlogoAppComponent = FlogoAppComponent;
