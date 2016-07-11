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
var mocks_1 = require('../mocks');
var http_1 = require('@angular/http');
var utils_1 = require('../utils');
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
                        state['flowUri'] = state['flowUri'].replace(pattern, "flows/" + newFlowID);
                    }
                    var headers = new http_1.Headers({
                        'Accept': 'application/json'
                    });
                    var options = new http_1.RequestOptions({ headers: headers });
                    return _this.http.get(state['flowUri'], options)
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
                        return _this.http.post(utils_1.getEngineURL() + "/flow/restart", body, options)
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
                return _this.http.get(utils_1.getStateServerURL() + "/instances/" + id, options)
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
                return _this.http.get(utils_1.getStateServerURL() + "/instances/" + id + "/steps", options)
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
                return _this.http.get(utils_1.getStateServerURL() + "/instances/" + id + "/status", options)
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
                return _this.http.get(utils_1.getStateServerURL() + "/instances/" + instanceID + "/snapshot/" + snapshotID, options)
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
        this._initActivities();
        this.engine = {
            restart: function () {
            }
        };
    }
    RESTAPIService.prototype._initActivities = function () {
        var _this = this;
        var activities = mocks_1.MOCK_TASKS.map(function (activity, index) { return Object.assign({ isInstalled: index < 2, version: '0.0.1' }, activity); });
        var getCopy = function (arr) { return arr.map(function (activity) { return Object.assign({}, activity); }); };
        var self = this;
        this.activities = {
            getAll: function () {
                return Promise.resolve(getCopy(activities));
            },
            getInstalled: function () {
                var installed = activities.filter(function (activity) { return activity.isInstalled; });
                return Promise.resolve(getCopy(installed));
            },
            getAvailableToInstall: function () {
                var available = activities.filter(function (activity) { return !activity.isInstalled; });
                return Promise.resolve(getCopy(available));
            },
            install: function (activitiesToInstall) {
                var installMap = activitiesToInstall.reduce(function (map, a) {
                    map[a.name] = a.version || '0.0.1';
                    return map;
                }, {});
                activities
                    .filter(function (activity) {
                    return installMap[activity.name] && installMap[activity.name] == activity.version;
                })
                    .forEach(function (activity) { return activity.isInstalled = true; });
                return self.activities.getInstalled();
            },
            uninstall: function () {
                console.warn('Not implemented yet');
            }
        };
        this.activities.get = function () {
            if (!status) {
                return _this.activities.getAll();
            }
            else if (status == 'installed') {
                return _this.activities.getInstalled();
            }
            else if (status == 'none') {
                return _this.activities.getAvailableToInstall();
            }
            throw new Error("Unknown option \"" + status + "\"");
        };
    };
    RESTAPIService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], RESTAPIService);
    return RESTAPIService;
}());
exports.RESTAPIService = RESTAPIService;
