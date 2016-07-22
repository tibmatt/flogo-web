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
var db_service_1 = require('../db.service');
var http_1 = require('@angular/http');
require('rxjs/add/operator/toPromise');
var RESTAPIFlowsService = (function () {
    function RESTAPIFlowsService(_db, http) {
        this._db = _db;
        this.http = http;
    }
    RESTAPIFlowsService.prototype.createFlow = function (flowObj) {
        var _this = this;
        flowObj._id = this._db.generateFlowID();
        flowObj.$table = this._db.FLOW;
        return new Promise(function (resolve, reject) {
            _this._db.create(flowObj).then(function (response) {
                resolve(response);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    RESTAPIFlowsService.prototype.getFlows = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = {
                include_docs: true,
                startKey: "" + _this._db.FLOW + _this._db.DELIMITER + _this._db.DEFAULT_USER_ID + _this._db.DELIMITER,
                endKey: "" + _this._db.FLOW + _this._db.DELIMITER + _this._db.DEFAULT_USER_ID + _this._db.DELIMITER + "\uFFFF"
            };
            _this._db.allDocs(options).then(function (response) {
                var allFlows = [];
                var rows = response && response.rows || [];
                rows.forEach(function (item) {
                    if (item && item.doc && item.doc.$table === _this._db.FLOW) {
                        allFlows.push(item.doc);
                    }
                });
                resolve(allFlows);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    RESTAPIFlowsService.prototype.updateFlow = function (flowObj) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._db.update(flowObj).then(function (response) {
                resolve(response);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    RESTAPIFlowsService.prototype.deleteFlow = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var parameters = arguments;
        return new Promise(function (resolve, reject) {
            _this._db.remove.apply(_this, parameters).then(function (response) {
                resolve(response);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    RESTAPIFlowsService.prototype.getFlow = function (id) {
        return this._db.getFlow(id);
    };
    RESTAPIFlowsService.prototype.uploadFlow = function (process) {
        var body = JSON.stringify(process);
        var headers = new http_1.Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
        var options = new http_1.RequestOptions({ headers: headers });
        return this.http.post('/v1/api/flows/run/flows', body, options)
            .toPromise().then(function (response) {
            if (response.text()) {
                return response.json();
            }
            else {
                return {};
            }
        });
    };
    RESTAPIFlowsService.prototype.startFlow = function (id, data) {
        var body = JSON.stringify({
            "flowId": id,
            "attrs": data
        });
        var headers = new http_1.Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
        var options = new http_1.RequestOptions({ headers: headers });
        return this.http.post('/v1/api/flows/run/flow/start', body, options)
            .toPromise()
            .then(function (rsp) {
            if (rsp.text()) {
                return rsp.json();
            }
            else {
                return rsp;
            }
        });
    };
    RESTAPIFlowsService.prototype.importFlow = function (importFile) {
        return new Promise(function (resolve, reject) {
            var formData = new FormData();
            var xhr = new XMLHttpRequest();
            formData.append('importFile', importFile, importFile.name);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                    }
                    else {
                        reject({
                            status: xhr.status,
                            statusText: xhr.statusText,
                            response: xhr.response
                        });
                    }
                }
            };
            xhr.open('POST', '/v1/api/flows/json', true);
            xhr.send(formData);
        });
    };
    RESTAPIFlowsService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [db_service_1.FlogoDBService, http_1.Http])
    ], RESTAPIFlowsService);
    return RESTAPIFlowsService;
}());
exports.RESTAPIFlowsService = RESTAPIFlowsService;
