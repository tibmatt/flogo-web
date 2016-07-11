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
var flows_api_service_1 = require('./restapi/flows-api.service');
var activities_api_service_1 = require('./restapi/activities-api.service');
var triggers_api_service_1 = require('./restapi/triggers-api.service');
var RESTAPITest = (function () {
    function RESTAPITest(_flow) {
        this._flow = _flow;
        this.testFlow();
    }
    RESTAPITest.prototype.print = function (title, request, response, fail) {
        var className = 'panel-success';
        if (fail) {
            className = 'panel-danger';
        }
        if (request) {
            if (typeof request == 'object') {
                request = JSON.stringify(request, null, 2);
            }
            else {
                request = request.toString();
            }
        }
        else {
            request = '';
        }
        if (response) {
            if (typeof response == 'object') {
                response = JSON.stringify(response, null, 2);
            }
            else {
                response = response.toString();
            }
        }
        else {
            response = '';
        }
        var html = "\n    <div class=\"panel " + className + "\">\n      <div class=\"panel-heading\">" + title + "</div>\n      <div class=\"panel-body\">\n        <h3>\n          Request\n        </h3>\n        <pre>" + request + "</pre>\n        <h3>\n          Response\n        </h3>\n        <pre>" + response + "</pre>\n\n      </div>\n    </div>\n    ";
        jQuery("#test-container").append(html);
    };
    RESTAPITest.prototype.testFlow = function () {
        var _this = this;
        new Promise(function (resolve, reject) {
            var request = {
                name: "My First Flow " + new Date().toISOString(),
                description: "Created by rest-api.spec"
            };
            _this._flow.createFlow(_.clone(request)).then(function (response) {
                console.log("create flow successful. ", response);
                _this.print('create flow successful', request, response);
                resolve(response);
            }).catch(function (err) {
                console.log("create flow error. ", err);
                _this.print('create flow error', request, err, true);
                reject(err);
            });
        }).then(function (response) {
            return new Promise(function (resolve, reject) {
                _this._flow.getFlows().then(function (response) {
                    _this.print('get all flows successful', null, response);
                    resolve(response);
                }).catch(function (err) {
                    _this.print('get all flows error', null, err, true);
                    reject(err);
                });
            });
        }).then(function (response) {
            return new Promise(function (resolve, reject) {
                var flow = response && response[0] || {};
                flow.name = flow.name + "change name ";
                _this._flow.updateFlow(flow).then(function (response) {
                    _this.print('update flow successful', flow, response);
                    resolve(response);
                }).catch(function (err) {
                    _this.print('update flow error', flow, err, true);
                    reject(err);
                });
            });
        }).then(function (response) {
            return new Promise(function (resolve, reject) {
                var id = response.id;
                var rev = response.rev;
                _this._flow.deleteFlow(id, rev).then(function (response) {
                    _this.print('remove flow successful', { id: id, rev: rev }, response);
                    resolve(response);
                }).catch(function (err) {
                    _this.print('remove flow error', { id: id, rev: rev }, err, true);
                    reject(err);
                });
            });
        });
    };
    RESTAPITest = __decorate([
        core_1.Component({
            moduleId: module.id,
            template: "<div id=\"test-container\" class=\"container\">\n\n            </div>",
            providers: [flows_api_service_1.RESTAPIFlowsService, activities_api_service_1.RESTAPIActivitiesService, triggers_api_service_1.RESTAPITriggersService]
        }), 
        __metadata('design:paramtypes', [flows_api_service_1.RESTAPIFlowsService])
    ], RESTAPITest);
    return RESTAPITest;
}());
exports.RESTAPITest = RESTAPITest;
