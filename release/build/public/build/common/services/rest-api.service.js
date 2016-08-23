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
var http_1 = require('@angular/http');
var RESTAPIService = (function () {
    function RESTAPIService(http) {
        var _this = this;
        this.http = http;
        this.flows = {
            restartWithIcptFrom: function (id, data, step, curFlowID, newFlowID) {
                var snapshotID = step - 1;
                if (snapshotID < 1) {
                    return Promise.reject("Invalid step " + step + " to start from.");
                }
                return _this.instances.getSnapshot(id, snapshotID)
                    .then(function (state) {
                    if (newFlowID && curFlowID) {
                        var pattern = new RegExp("flows/" + curFlowID);
                        state['actionUri'] = state['flowUri'].replace(pattern, "flows/" + newFlowID);
                        state['flowUri'] = state['actionUri'];
                    }
                    var headers = new http_1.Headers({
                        'Accept': 'application/json'
                    });
                    var options = new http_1.RequestOptions({ headers: headers });
                    return _this.http.get('/v1/api/flows/run/flows/' + newFlowID, options)
                        .toPromise()
                        .then(function (rsp) {
                        if (rsp.text()) {
                            return rsp.json();
                        }
                        else {
                            return rsp;
                        }
                    })
                        .then(function (flowInfo) {
                        var icptTaskIds = _.map(data.tasks, function (task) {
                            return task.id;
                        });
                        var workQueue = _.get(state, 'workQueue', []);
                        var taskDatas = _.get(state, 'rootTaskEnv.taskDatas', []);
                        var linksInfo = _.get(flowInfo, 'rootTask.links', []);
                        var taskInPath = icptTaskIds.slice();
                        var linksToGo = linksInfo.slice();
                        var lastLinksToGoLength = linksToGo.length;
                        while (linksToGo.length) {
                            linksToGo = _.filter(linksToGo, function (link) {
                                if (taskInPath.indexOf(link.from) !== -1) {
                                    if (taskInPath.indexOf(link.to) === -1) {
                                        taskInPath.push(link.to);
                                    }
                                    return false;
                                }
                                return true;
                            });
                            if (lastLinksToGoLength === linksToGo.length) {
                                break;
                            }
                            lastLinksToGoLength = linksToGo.length;
                        }
                        workQueue = _.filter(workQueue, function (queueItem) {
                            return taskInPath.indexOf(queueItem.taskID) !== -1;
                        });
                        taskDatas = _.filter(taskDatas, function (taskData) {
                            return taskData.taskId === 1 || taskInPath.indexOf(taskData.taskId) !== -1;
                        });
                        _.set(state, 'workQueue', workQueue);
                        _.set(state, 'rootTaskEnv.taskDatas', taskDatas);
                        var body = JSON.stringify({
                            'initialState': state,
                            'interceptor': data
                        });
                        var headers = new http_1.Headers({
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        });
                        var options = new http_1.RequestOptions({ headers: headers });
                        return _this.http.post("/v1/api/flows/run/restart", body, options)
                            .toPromise()
                            .then(function (rsp) {
                            if (rsp.text()) {
                                return rsp.json();
                            }
                            else {
                                return rsp;
                            }
                        });
                    });
                });
            }
        };
        this.instances = {
            getInstance: function (id) {
                var headers = new http_1.Headers({
                    'Accept': 'application/json'
                });
                var options = new http_1.RequestOptions({ headers: headers });
                return _this.http.get("/v1/api/flows/run/instances/" + id, options)
                    .toPromise()
                    .then(function (rsp) {
                    if (rsp.text()) {
                        return rsp.json();
                    }
                    else {
                        return rsp;
                    }
                });
            },
            getStepsByInstanceID: function (id) {
                var headers = new http_1.Headers({
                    'Accept': 'application/json'
                });
                var options = new http_1.RequestOptions({ headers: headers });
                return _this.http.get("/v1/api/flows/run/instances/" + id + "/steps", options)
                    .toPromise()
                    .then(function (rsp) {
                    if (rsp.text()) {
                        return rsp.json();
                    }
                    else {
                        return rsp;
                    }
                });
            },
            getStatusByInstanceID: function (id) {
                var headers = new http_1.Headers({
                    'Accept': 'application/json'
                });
                var options = new http_1.RequestOptions({ headers: headers });
                return _this.http.get("/v1/api/flows/run/instances/" + id + "/status", options)
                    .toPromise()
                    .then(function (rsp) {
                    if (rsp.text()) {
                        return rsp.json();
                    }
                    else {
                        return rsp;
                    }
                });
            },
            getSnapshot: function (instanceID, snapshotID) {
                var headers = new http_1.Headers({
                    'Accept': 'application/json'
                });
                var options = new http_1.RequestOptions({ headers: headers });
                return _this.http.get("/v1/api/flows/run/instances/" + instanceID + "/snapshot/" + snapshotID, options)
                    .toPromise()
                    .then(function (rsp) {
                    if (rsp.text()) {
                        return rsp.json();
                    }
                    else {
                        return rsp;
                    }
                });
            },
            whenInstanceFinishByID: function (id) {
                return new Promise(function (resolve, reject) {
                    var TIMEOUT = 1000;
                    var _recur = function () {
                        setTimeout(function () {
                            this.instances.getStatusByInstanceID(id)
                                .then(function (rsp) {
                                if (rsp.status === "500") {
                                    resolve(rsp);
                                }
                                else {
                                    _recur();
                                }
                            })
                                .catch(reject);
                        }.bind(_this), TIMEOUT);
                    };
                    _recur();
                });
            }
        };
        this.engine = {
            restart: function () {
            }
        };
    }
    RESTAPIService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], RESTAPIService);
    return RESTAPIService;
}());
exports.RESTAPIService = RESTAPIService;
