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
var post_service_1 = require('../../../common/services/post.service');
var components_1 = require('../../flogo.flows.detail.diagram/components');
var flow_detail_component_1 = require('./flow-detail.component');
var triggers_component_1 = require('../../flogo.flows.detail.triggers/components/triggers.component');
var detail_component_1 = require('../../flogo.flows.detail.triggers.detail/components/detail.component');
var tasks_component_1 = require('../../flogo.flows.detail.tasks/components/tasks.component');
var detail_component_2 = require('../../flogo.flows.detail.tasks.detail/components/detail.component');
var transform_component_1 = require('../../flogo.transform/components/transform.component');
var messages_1 = require('../../flogo.flows.detail.diagram/messages');
var messages_2 = require('../../flogo.flows.detail.triggers/messages');
var messages_3 = require('../../flogo.flows.detail.tasks/messages');
var messages_4 = require('../../flogo.flows.detail.tasks.detail/messages');
var messages_5 = require('../../flogo.form-builder/messages');
var messages_6 = require('../../flogo.transform/messages');
var rest_api_service_1 = require('../../../common/services/rest-api.service');
var flows_api_service_1 = require('../../../common/services/restapi/flows-api.service');
var constants_1 = require('../../../common/constants');
var utils_1 = require('../../../common/utils');
var contenteditable_directive_1 = require('../../../common/directives/contenteditable.directive');
var flow_model_1 = require('../../flogo.flows.detail.diagram/models/flow.model');
var modal_service_1 = require('../../../common/services/modal.service');
var FlogoCanvasComponent = (function () {
    function FlogoCanvasComponent(_postService, _restAPIService, _restAPIFlowsService, _routerParams, _router, _flogoModal) {
        var _this = this;
        this._postService = _postService;
        this._restAPIService = _restAPIService;
        this._restAPIFlowsService = _restAPIFlowsService;
        this._routerParams = _routerParams;
        this._router = _router;
        this._flogoModal = _flogoModal;
        this._isCurrentProcessDirty = true;
        this._mockLoading = true;
        this._hasUploadedProcess = false;
        this._isDiagramEdited = false;
        this._mockLoading = true;
        var id = '' + this._routerParams.params['id'];
        this._id = id;
        this.downloadLink = "/v1/api/flows/" + this._id + "/build";
        try {
            id = utils_1.flogoIDDecode(id);
        }
        catch (e) {
            console.warn(e);
        }
        this.exportLink = "/v1/api/flows/" + id + "/json";
        this._restAPIFlowsService.getFlow(id)
            .then(function (rsp) {
            if (!_.isEmpty(rsp)) {
                console.group('Initialise canvas component');
                _this._flow = rsp;
                _this.tasks = _this._flow.items;
                if (_.isEmpty(_this._flow.paths)) {
                    _this.diagram = _this._flow.paths = {
                        root: {},
                        nodes: {}
                    };
                }
                else {
                    _this.diagram = _this._flow.paths;
                }
                _this.clearTaskRunStatus();
                _this.initSubscribe();
                console.groupEnd();
                return _this._updateFlow(_this._flow);
            }
            else {
                return _this._flow;
            }
        })
            .then(function () {
            _this._mockLoading = false;
        })
            .catch(function (err) {
            if (err.status === 404) {
                _this._router.navigate(['FlogoFlows']);
            }
            else {
                return err;
            }
        });
    }
    FlogoCanvasComponent.prototype.initSubscribe = function () {
        var _this = this;
        this._subscriptions = [];
        var subs = [
            _.assign({}, messages_1.PUB_EVENTS.addTask, { callback: this._addTaskFromDiagram.bind(this) }),
            _.assign({}, messages_1.PUB_EVENTS.addTrigger, { callback: this._addTriggerFromDiagram.bind(this) }),
            _.assign({}, messages_1.PUB_EVENTS.selectTask, { callback: this._selectTaskFromDiagram.bind(this) }),
            _.assign({}, messages_1.PUB_EVENTS.deleteTask, { callback: this._deleteTaskFromDiagram.bind(this) }),
            _.assign({}, messages_1.PUB_EVENTS.addBranch, { callback: this._addBranchFromDiagram.bind(this) }),
            _.assign({}, messages_1.PUB_EVENTS.selectBranch, { callback: this._selectBranchFromDiagram.bind(this) }),
            _.assign({}, messages_1.PUB_EVENTS.selectTransform, { callback: this._selectTransformFromDiagram.bind(this) }),
            _.assign({}, messages_1.PUB_EVENTS.selectTrigger, { callback: this._selectTriggerFromDiagram.bind(this) }),
            _.assign({}, messages_2.PUB_EVENTS.addTrigger, { callback: this._addTriggerFromTriggers.bind(this) }),
            _.assign({}, messages_3.PUB_EVENTS.addTask, { callback: this._addTaskFromTasks.bind(this) }),
            _.assign({}, messages_4.PUB_EVENTS.selectTask, { callback: this._selectTaskFromTasks.bind(this) }),
            _.assign({}, messages_5.PUB_EVENTS.runFromThisTile, { callback: this._runFromThisTile.bind(this) }),
            _.assign({}, messages_5.PUB_EVENTS.runFromTrigger, { callback: this._runFromTriggerinTile.bind(this) }),
            _.assign({}, messages_5.PUB_EVENTS.setTaskWarnings, { callback: this._setTaskWarnings.bind(this) }),
            _.assign({}, messages_6.PUB_EVENTS.saveTransform, { callback: this._saveTransformFromTransform.bind(this) }),
            _.assign({}, messages_6.PUB_EVENTS.deleteTransform, { callback: this._deleteTransformFromTransform.bind(this) }),
            _.assign({}, messages_5.PUB_EVENTS.taskDetailsChanged, { callback: this._taskDetailsChanged.bind(this) }),
            _.assign({}, messages_5.PUB_EVENTS.changeTileDetail, { callback: this._changeTileDetail.bind(this) })
        ];
        _.each(subs, function (sub) {
            _this._subscriptions.push(_this._postService.subscribe(sub));
        });
    };
    FlogoCanvasComponent.prototype.ngOnDestroy = function () {
        var _this = this;
        _.each(this._subscriptions, function (sub) {
            _this._postService.unsubscribe(sub);
        });
    };
    FlogoCanvasComponent.prototype.isOnDefaultRoute = function () {
        return this._router.isRouteActive(this._router.generate(['FlogoFlowsDetailDefault']));
    };
    FlogoCanvasComponent.prototype.changeFlowDetail = function ($event, property) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._updateFlow(_this._flow).then(function (response) {
                utils_1.notification("Update flow's " + property + " successfully!", 'success', 3000);
                resolve(response);
            }).catch(function (err) {
                utils_1.notification("Update flow's " + property + " error: " + err, 'error');
                reject(err);
            });
        });
    };
    FlogoCanvasComponent.prototype._updateMockProcess = function () {
        var _this = this;
        if (!_.isEmpty(this._flow)) {
            this._restAPIFlowsService.getFlows()
                .then(function (rsp) {
                _this._mockProcess = _.find(rsp, { _id: _this._flow._id });
                _this._mockProcess = flow_model_1.flogoFlowToJSON(_this._mockProcess);
            });
        }
    };
    FlogoCanvasComponent.prototype._runFromTrigger = function (data) {
        var _this = this;
        this._isDiagramEdited = false;
        if (this._isCurrentProcessDirty) {
            return this.uploadProcess()
                .then(function (rsp) {
                if (!_.isEmpty(rsp)) {
                    return _this.startAndMonitorProcess(rsp.id, {
                        initData: data
                    });
                }
                else {
                    return _this.startAndMonitorProcess(_this._currentProcessID, {
                        initData: data
                    });
                }
            })
                .then(function () {
                return _this.mockGetSteps();
            });
        }
        else {
            return this.startAndMonitorProcess(this._currentProcessID, {
                initData: data
            })
                .then(function () {
                return _this.mockGetSteps();
            });
        }
    };
    FlogoCanvasComponent.prototype._runFromRoot = function () {
        var initData = _.get(this.tasks[this.diagram.nodes[this.diagram.root.is].taskID], '__props.outputs');
        if (_.isEmpty(initData)) {
            return this._runFromTrigger();
        }
        else {
            initData = _(initData)
                .filter(function (item) {
                return !_.isNil(item.value);
            })
                .map(function (item) {
                var outItem = _.cloneDeep(item);
                outItem.type = utils_1.attributeTypeToString(outItem.type);
                return outItem;
            });
            return this._runFromTrigger(initData);
        }
    };
    FlogoCanvasComponent.prototype._updateFlow = function (flow) {
        var _this = this;
        this._isCurrentProcessDirty = true;
        flow = _.cloneDeep(flow);
        _.each(_.keys(flow.paths), function (key) {
            if (key !== 'root' && key !== 'nodes') {
                delete flow.paths[key];
            }
        });
        flow = JSON.parse(JSON.stringify(flow));
        return this._restAPIFlowsService.updateFlow(flow)
            .then(function (rsp) {
            console.log(rsp);
        })
            .then(function () {
            return _this._updateMockProcess();
        });
    };
    FlogoCanvasComponent.prototype.uploadProcess = function (updateCurrentProcessID) {
        var _this = this;
        if (updateCurrentProcessID === void 0) { updateCurrentProcessID = true; }
        this._uploadingProcess = true;
        var process = flow_model_1.flogoFlowToJSON(this._flow);
        delete process.id;
        return this._restAPIFlowsService.uploadFlow(process).then(function (rsp) {
            if (updateCurrentProcessID) {
                _this._uploadingProcess = false;
                _this._hasUploadedProcess = true;
                _this._flowID = rsp.id;
                if (!_.isEmpty(rsp)) {
                    _this._currentProcessID = rsp.id;
                    _this._isCurrentProcessDirty = false;
                }
            }
            return rsp;
        });
    };
    FlogoCanvasComponent.prototype.startProcess = function (id, initData) {
        var _this = this;
        this._startingProcess = true;
        this._steps = null;
        this.clearTaskRunStatus();
        try {
            var rootTask = this.tasks[this.diagram.nodes[this.diagram.root.is].taskID];
            rootTask.__status['hasRun'] = true;
            rootTask.__status['isRunning'] = false;
        }
        catch (e) {
            console.warn(e);
            console.warn('No root task/trigger is found.');
        }
        this._postService.publish(messages_1.SUB_EVENTS.render);
        return this._restAPIFlowsService.startFlow(id || this._currentProcessID, initData || [])
            .then(function (rsp) {
            _this._startingProcess = false;
            _this._processInstanceID = rsp.id;
            return rsp;
        })
            .then(function (rsp) {
            console.log(rsp);
            return rsp;
        })
            .catch(function (err) {
            _this._startingProcess = false;
            console.error(err);
            throw err;
        });
    };
    FlogoCanvasComponent.prototype.startAndMonitorProcess = function (processID, opt) {
        var _this = this;
        return this.startProcess(processID, opt && opt.initData)
            .then(function (rsp) {
            return _this.monitorProcessStatus(rsp.id, opt);
        })
            .then(function (rsp) {
            return _this.updateTaskRunStatus();
        })
            .then(function (rsp) {
            return _this._restAPIService.instances.getInstance(_this._processInstanceID);
        })
            .then(function (rsp) {
            _this._lastProcessInstanceFromBeginning = rsp;
            return rsp;
        })
            .catch(function (err) {
            console.error(err);
            utils_1.notification('Ops! something wrong! :(', 'error');
            return err;
        });
    };
    FlogoCanvasComponent.prototype.monitorProcessStatus = function (processInstanceID, opt) {
        processInstanceID = processInstanceID || this._processInstanceID;
        opt = _.assign({}, {
            maxTrials: 20,
            queryInterval: 500
        }, opt);
        if (processInstanceID) {
            var trials_1 = 0;
            var self_1 = this;
            return new Promise(function (resolve, reject) {
                var processingStatus = { done: false };
                var done = function (timer, rsp) {
                    processingStatus.done = true;
                    clearInterval(timer);
                    return resolve(rsp);
                };
                var stopOnError = function (timer, rsp) {
                    processingStatus.done = true;
                    clearInterval(timer);
                    return reject(rsp);
                };
                var timer = setInterval(function () {
                    if (trials_1 > opt.maxTrials) {
                        clearInterval(timer);
                        reject("Reach maximum trial time: " + opt.maxTrials);
                        return;
                    }
                    trials_1++;
                    self_1._restAPIService.instances.getStatusByInstanceID(processInstanceID)
                        .then(function (rsp) {
                        (function (n) {
                            switch (rsp.status) {
                                case '0':
                                    console.log("[PROC STATE][" + n + "] Process didn't start.");
                                    break;
                                case '100':
                                    console.log("[PROC STATE][" + n + "] Process is running...");
                                    self_1.updateTaskRunStatus(rsp.id, processingStatus)
                                        .then(function (status) {
                                        console.group("[PROC STATE][" + n + "] status");
                                        console.log(status);
                                        var isFlowDone = _.get(status, '__status.isFlowDone');
                                        if (isFlowDone) {
                                            done(timer, rsp);
                                        }
                                        console.groupEnd();
                                    })
                                        .catch(function (err) {
                                        console.group("[PROC STATE][" + n + "] on error");
                                        console.log(err);
                                        stopOnError(timer, err);
                                        console.groupEnd();
                                    });
                                    break;
                                case '500':
                                    console.log("[PROC STATE][" + n + "] Process finished.");
                                    utils_1.notification('Flow completed! ^_^', 'success', 3000);
                                    done(timer, rsp);
                                    break;
                                case '600':
                                    console.log("[PROC STATE][" + n + "] Process has been cancelled.");
                                    utils_1.notification('Flow has been cancelled.', 'warning', 3000);
                                    done(timer, rsp);
                                    break;
                                case '700':
                                    console.log("[PROC STATE][" + n + "] Process is failed.");
                                    utils_1.notification('Flow is failed with error code 700.', 'error');
                                    done(timer, rsp);
                                    break;
                                case null:
                                    console.log("[PROC STATE][" + n + "] Process status is null, retrying...");
                                    break;
                            }
                            console.log(rsp);
                        }(trials_1));
                    });
                }, opt.queryInterval);
            });
        }
        else {
            console.warn('No process instance has been logged.');
            return Promise.reject('No process instance has been logged.');
        }
    };
    FlogoCanvasComponent.prototype.clearTaskRunStatus = function () {
        var statusToClean = ['isRunning', 'hasRun'];
        _.forIn(this.tasks, function (task, taskID) {
            _.set(task, '__props.errors', []);
            if (_.isNil(task.__status)) {
                task.__status = {};
            }
            _.forIn(task.__status, function (status, key) {
                if (statusToClean.indexOf(key) !== -1) {
                    task.__status[key] = false;
                }
            });
        });
    };
    FlogoCanvasComponent.prototype.updateTaskRunStatus = function (processInstanceID, processingStatus) {
        var _this = this;
        processInstanceID = processInstanceID || this._processInstanceID;
        if (processInstanceID) {
            return this._restAPIService.instances.getStepsByInstanceID(processInstanceID)
                .then(function (rsp) {
                if (_.has(processingStatus, 'done') && processingStatus.done) {
                    console.warn('Just logging to know if any query is discarded');
                    return rsp;
                }
                else {
                    var steps = _.get(rsp, 'steps', []);
                    var runTasksIDs_1 = [];
                    var errors_1 = {};
                    var isFlowDone_1 = false;
                    var runTasks = _.reduce(steps, function (result, step) {
                        var taskID = step.taskId;
                        if (taskID !== 1 && !_.isNil(taskID)) {
                            taskID = utils_1.flogoIDEncode('' + taskID);
                            runTasksIDs_1.push(taskID);
                            var reAttrName_1 = new RegExp("^\\[A" + step.taskId + "\\..*", 'g');
                            var reAttrErrMsg_1 = new RegExp("^\\[A" + step.taskId + "\\._errorMsg\\]$", 'g');
                            var taskInfo = _.reduce(_.get(step, 'flow.attributes', []), function (taskInfo, attr) {
                                if (reAttrName_1.test(_.get(attr, 'name', ''))) {
                                    taskInfo[attr.name] = attr;
                                    if (reAttrErrMsg_1.test(attr.name)) {
                                        var errs = _.get(errors_1, "" + taskID);
                                        var shouldOverride = _.isUndefined(errs);
                                        errs = errs || [];
                                        errs.push({
                                            msg: attr.value,
                                            time: new Date().toJSON()
                                        });
                                        if (shouldOverride) {
                                            _.set(errors_1, "" + taskID, errs);
                                        }
                                    }
                                }
                                return taskInfo;
                            }, {});
                            result[taskID] = { attrs: taskInfo };
                        }
                        else if (_.isNull(taskID)) {
                            isFlowDone_1 = true;
                        }
                        return result;
                    }, {});
                    _.each(runTasksIDs_1, function (runTaskID) {
                        var task = _this.tasks[runTaskID];
                        if (task) {
                            task.__status['hasRun'] = true;
                            task.__status['isRunning'] = false;
                            var errs = errors_1[runTaskID];
                            if (!_.isUndefined(errs)) {
                                _.set(task, '__props.errors', errs);
                            }
                        }
                    });
                    _.set(rsp, '__status', {
                        isFlowDone: isFlowDone_1,
                        errors: errors_1,
                        runTasks: runTasks,
                        runTasksIDs: runTasksIDs_1
                    });
                    utils_1.updateBranchNodesRunStatus(_this.diagram.nodes, _this.tasks);
                    _this._postService.publish(messages_1.SUB_EVENTS.render);
                    if (isFlowDone_1 && !_.isEmpty(errors_1)) {
                        throw rsp;
                    }
                }
                return rsp;
            });
        }
        else {
            console.warn('No flow has been started.');
            return Promise.reject({
                error: {
                    message: 'No flow has been started.'
                }
            });
        }
    };
    FlogoCanvasComponent.prototype.mockGetSteps = function () {
        var _this = this;
        this._mockGettingStepsProcess = true;
        if (this._processInstanceID) {
            return this._restAPIService.instances.getStepsByInstanceID(this._processInstanceID)
                .then(function (rsp) {
                _this._mockGettingStepsProcess = false;
                _this._steps = rsp.steps;
                console.log(rsp);
                return rsp;
            })
                .catch(function (err) {
                _this._mockGettingStepsProcess = false;
                console.error(err);
            });
        }
        else {
            console.warn('No process has been started.');
        }
    };
    FlogoCanvasComponent.prototype.trackBySteps = function (idx, s) {
        return s.id;
    };
    FlogoCanvasComponent.prototype.restartProcessFrom = function (step, newFlowID, dataOfInterceptor) {
        var _this = this;
        if (this._processInstanceID) {
            this._restartingProcess = true;
            this._steps = null;
            this.clearTaskRunStatus();
            this._postService.publish(messages_1.SUB_EVENTS.render);
            return this._restAPIService.flows.restartWithIcptFrom(this._processInstanceID, JSON.parse(dataOfInterceptor), step, this._flowID, newFlowID)
                .then(function (rsp) {
                _this._restartProcessInstanceID = rsp.id;
                _this._restartingProcess = false;
                return rsp;
            })
                .catch(function (err) {
                _this._restartingProcess = false;
                console.error(err);
                throw err;
            });
        }
        else {
            console.warn('Should start from trigger for the first time.');
            return Promise.reject('Should start from trigger for the first time.');
        }
    };
    FlogoCanvasComponent.prototype._addTriggerFromDiagram = function (data, envelope) {
        var _this = this;
        console.group('Add trigger message from diagram');
        console.log(data);
        console.log(envelope);
        this._router.navigate(['FlogoFlowsDetailTriggerAdd'])
            .then(function () {
            console.group('after navigation');
            _this._postService.publish(_.assign({}, messages_2.SUB_EVENTS.addTrigger, {
                data: data
            }));
            console.groupEnd();
        });
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._addTriggerFromTriggers = function (data, envelope) {
        var _this = this;
        console.group('Add trigger message from trigger');
        console.log(data);
        console.log(envelope);
        var trigger = _.assign({}, data.trigger, { id: utils_1.flogoGenTriggerID() });
        this.tasks[trigger.id] = trigger;
        this._router.navigate(['FlogoFlowsDetailDefault'])
            .then(function () {
            _this._postService.publish(_.assign({}, messages_1.SUB_EVENTS.addTrigger, {
                data: {
                    node: data.node,
                    task: trigger
                },
                done: function (diagram) {
                    _.assign(_this.diagram, diagram);
                    _this._updateFlow(_this._flow);
                    _this._isDiagramEdited = true;
                }
            }));
        });
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._addTaskFromDiagram = function (data, envelope) {
        var _this = this;
        console.group('Add task message from diagram');
        console.log(data);
        console.log(envelope);
        this._router.navigate(['FlogoFlowsDetailTaskAdd'])
            .then(function () {
            console.group('after navigation');
            _this._postService.publish(_.assign({}, messages_3.SUB_EVENTS.addTask, {
                data: data
            }));
            console.groupEnd();
        });
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._addTaskFromTasks = function (data, envelope) {
        var _this = this;
        console.group('Add task message from task');
        console.log(data);
        console.log(envelope);
        var taskName = this.uniqueTaskName(data.task.name);
        var task = _.assign({}, data.task, {
            id: utils_1.flogoGenTaskID(this.tasks),
            name: taskName
        });
        this.tasks[task.id] = task;
        this._router.navigate(['FlogoFlowsDetailDefault'])
            .then(function () {
            _this._postService.publish(_.assign({}, messages_1.SUB_EVENTS.addTask, {
                data: {
                    node: data.node,
                    task: task
                },
                done: function (diagram) {
                    _.assign(_this.diagram, diagram);
                    _this._updateFlow(_this._flow);
                    _this._isDiagramEdited = true;
                }
            }));
        });
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._selectTriggerFromDiagram = function (data, envelope) {
        var _this = this;
        console.group('Select trigger message from diagram');
        console.log(data);
        console.log(envelope);
        this._router.navigate([
            'FlogoFlowsDetailTaskDetail',
            { id: data.node.taskID }
        ])
            .then(function () {
            console.group('after navigation');
            var currentStep = _this._getCurrentState(data.node.taskID);
            var currentTask = _.assign({}, _.cloneDeep(_this.tasks[data.node.taskID]));
            var context = _this._getCurrentContext(data.node.taskID);
            _this._postService.publish(_.assign({}, messages_4.SUB_EVENTS.selectTask, {
                data: _.assign({}, data, { task: currentTask }, { step: currentStep }, { context: context }),
                done: function () {
                    _this._postService.publish(_.assign({}, messages_1.SUB_EVENTS.selectTrigger, {
                        data: {
                            node: data.node,
                            task: _this.tasks[data.node.taskID]
                        },
                        done: function (diagram) {
                            _.assign(_this.diagram, diagram);
                        }
                    }));
                }
            }));
            console.groupEnd();
        });
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._getCurrentContext = function (taskId) {
        var isTrigger = this.tasks[taskId].type === constants_1.FLOGO_TASK_TYPE.TASK_ROOT;
        var isBranch = this.tasks[taskId].type === constants_1.FLOGO_TASK_TYPE.TASK_BRANCH;
        var isTask = this.tasks[taskId].type === constants_1.FLOGO_TASK_TYPE.TASK;
        return {
            isTrigger: isTrigger,
            isBranch: isBranch,
            isTask: isTask,
            hasProcess: !!this._currentProcessID,
            isDiagramEdited: this._isDiagramEdited
        };
    };
    FlogoCanvasComponent.prototype._selectTaskFromDiagram = function (data, envelope) {
        var _this = this;
        console.group('Select task message from diagram');
        console.log(data);
        console.log(envelope);
        this._router.navigate([
            'FlogoFlowsDetailTaskDetail',
            { id: data.node.taskID }
        ])
            .then(function () {
            console.group('after navigation');
            var currentStep = _this._getCurrentState(data.node.taskID);
            var currentTask = _.assign({}, _.cloneDeep(_this.tasks[data.node.taskID]));
            var context = _this._getCurrentContext(data.node.taskID);
            _this._postService.publish(_.assign({}, messages_4.SUB_EVENTS.selectTask, {
                data: _.assign({}, data, { task: currentTask }, { step: currentStep }, { context: context }),
                done: function () {
                    _this._postService.publish(_.assign({}, messages_1.SUB_EVENTS.selectTask, {
                        data: {
                            node: data.node,
                            task: _this.tasks[data.node.taskID]
                        },
                        done: function (diagram) {
                            _.assign(_this.diagram, diagram);
                        }
                    }));
                }
            }));
            console.groupEnd();
        });
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._selectTaskFromTasks = function (data, envelope) {
        var _this = this;
        console.group('Select task message from task');
        console.log(data);
        console.log(envelope);
        this.tasks[data.task.id] = data.task;
        this._router.navigate(['FlogoFlowsDetailDefault'])
            .then(function () {
            _this._postService.publish(_.assign({}, messages_1.SUB_EVENTS.selectTask, {
                data: {
                    node: data.node,
                    task: data.task
                },
                done: function (diagram) {
                    _.assign(_this.diagram, diagram);
                }
            }));
        });
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._getStepNumberFromSteps = function (taskId) {
        var stepNumber = 0;
        var steps = _.get(this._lastProcessInstanceFromBeginning, 'steps', this._steps || []);
        taskId = utils_1.flogoIDDecode(taskId);
        steps.forEach(function (step, index) {
            if (step.taskId == taskId) {
                stepNumber = index + 1;
            }
        });
        return stepNumber;
    };
    FlogoCanvasComponent.prototype._getCurrentState = function (taskID) {
        var result;
        var steps = this._steps || [];
        steps.forEach(function (current) {
            var id = taskID;
            try {
                id = utils_1.flogoIDDecode(id);
            }
            catch (e) {
                console.warn(e);
            }
            if (id == current.taskId) {
                result = current;
            }
        });
        return result;
    };
    FlogoCanvasComponent.prototype._changeTileDetail = function (data, envelope) {
        var _this = this;
        var task = this.tasks[data.taskId];
        if (task) {
            if (data.proper == 'name') {
                task[data.proper] = this.uniqueTaskName(data.content);
            }
            else {
                task[data.proper] = data.content;
            }
            this._updateFlow(this._flow).then(function () {
                _this._postService.publish(messages_1.SUB_EVENTS.render);
            });
        }
    };
    FlogoCanvasComponent.prototype._setTaskWarnings = function (data, envelope) {
        var _this = this;
        var task = this.tasks[data.taskId];
        if (task) {
            _.set(task, '__props.warnings', data.warnings);
            this._updateFlow(this._flow).then(function () {
                _this._postService.publish(messages_1.SUB_EVENTS.render);
            });
        }
    };
    FlogoCanvasComponent.prototype._runFromThisTile = function (data, envelope) {
        var _this = this;
        console.group('Run from this tile');
        var selectedTask = this.tasks[data.taskId];
        if (selectedTask.type === constants_1.FLOGO_TASK_TYPE.TASK_ROOT) {
            this._runFromRoot();
        }
        else if (this._processInstanceID) {
            var step_1 = this._getStepNumberFromSteps(data.taskId);
            if (step_1) {
                this.uploadProcess(false).then(function (rsp) {
                    if (!_.isEmpty(rsp)) {
                        var newFlowID = rsp.id;
                        var dataOfInterceptor = {
                            tasks: [
                                {
                                    id: parseInt(utils_1.flogoIDDecode(selectedTask.id)),
                                    inputs: (function parseInput(d) {
                                        var attrs = _.get(selectedTask, 'attributes.inputs');
                                        if (attrs) {
                                            return _.map(attrs, function (input) {
                                                return _.assign(_.cloneDeep(input), {
                                                    value: d[input['name']],
                                                    type: utils_1.attributeTypeToString(input['type'])
                                                });
                                            });
                                        }
                                        else {
                                            return [];
                                        }
                                    }(data.inputs))
                                }
                            ]
                        };
                        _this.restartProcessFrom(step_1, newFlowID, JSON.stringify(dataOfInterceptor))
                            .then(function (rsp) {
                            return _this.monitorProcessStatus(rsp.id);
                        })
                            .then(function (rsp) {
                            return _this.updateTaskRunStatus(rsp.id);
                        })
                            .then(function (rsp) {
                            _this._steps = _.get(rsp, 'steps', []);
                            var currentStep = _this._getCurrentState(data.taskId);
                            var currentTask = _.assign({}, _.cloneDeep(_this.tasks[data.taskId]));
                            var context = _this._getCurrentContext(data.taskId);
                            _this._postService.publish(_.assign({}, messages_4.SUB_EVENTS.selectTask, {
                                data: _.assign({}, data, { task: currentTask }, { step: currentStep }, { context: context })
                            }));
                        })
                            .then(function () {
                            if (_.isFunction(envelope.done)) {
                                envelope.done();
                            }
                        })
                            .catch(function (err) {
                            console.error(err);
                            return err;
                        });
                    }
                });
            }
            else {
                console.warn('Cannot find proper step to restart from, skipping...');
            }
        }
        else {
            var task = this.tasks[data.taskId];
            console.error("Cannot start from task " + task.name + " (" + task.id + ")");
        }
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._runFromTriggerinTile = function (data, envolope) {
        var _this = this;
        console.group('Run from Trigger');
        this._runFromRoot().then(function (res) {
            var currentStep = _this._getCurrentState(data.taskId);
            var currentTask = _.assign({}, _.cloneDeep(_this.tasks[data.taskId]));
            var context = _this._getCurrentContext(data.taskId);
            _this._postService.publish(_.assign({}, messages_4.SUB_EVENTS.selectTask, {
                data: _.assign({}, data, { task: currentTask }, { step: currentStep }, { context: context })
            }));
        })
            .catch(function (err) {
            console.error(err);
            return err;
        });
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._selectTransformFromDiagram = function (data, envelope) {
        var selectedNode = data.node;
        var previousNodes = this.findPathToNode(this.diagram.root.is, selectedNode.id);
        previousNodes.pop();
        var previousTiles = this.mapNodesToTiles(previousNodes);
        var selectedTaskId = selectedNode.taskID;
        this._postService.publish(_.assign({}, messages_6.SUB_EVENTS.selectActivity, {
            data: {
                previousTiles: previousTiles,
                tile: _.cloneDeep(this.tasks[selectedTaskId])
            }
        }));
    };
    FlogoCanvasComponent.prototype._saveTransformFromTransform = function (data, envelope) {
        var _this = this;
        var tile = this.tasks[data.tile.id];
        tile.inputMappings = _.cloneDeep(data.inputMappings);
        this._updateFlow(this._flow).then(function () {
            _this._postService.publish(messages_1.SUB_EVENTS.render);
        });
    };
    FlogoCanvasComponent.prototype._deleteTransformFromTransform = function (data, envelope) {
        var _this = this;
        var tile = this.tasks[data.tile.id];
        delete tile.inputMappings;
        this._updateFlow(this._flow).then(function () {
            _this._postService.publish(messages_1.SUB_EVENTS.render);
        });
    };
    FlogoCanvasComponent.prototype._deleteTaskFromDiagram = function (data, envelope) {
        var _this = this;
        console.group('Delete task message from diagram');
        console.log(data);
        var task = this.tasks[_.get(data, 'node.taskID', '')];
        var node = this.diagram.nodes[_.get(data, 'node.id', '')];
        var _diagram = this.diagram;
        if (node.type !== constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT && task) {
            this._flogoModal.confirmDelete('Are you sure you want to delete this task?').then(function (res) {
                if (res) {
                    var _shouldGoBack_1 = false;
                    var parsedURL = location.pathname.split('task/');
                    if (parsedURL.length === 2 && _.isString(parsedURL[1])) {
                        var currentTaskID = parsedURL[1];
                        var deletingTaskID = _.get(data, 'node.taskID', '');
                        if (currentTaskID === deletingTaskID ||
                            ((_.some(_.get(data, 'node.children', []), function (nodeId) {
                                return _diagram.nodes[nodeId].type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH;
                            }) || _.get(data, 'node.type') === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH)
                                && (function isTaskIsChildOf(taskID, parentNode, isInBranch) {
                                    if (isInBranch === void 0) { isInBranch = false; }
                                    var children = _.get(parentNode, 'children', []);
                                    if (parentNode.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
                                        isInBranch = true;
                                    }
                                    if (taskID === _.get(parentNode, 'taskID')) {
                                        return isInBranch;
                                    }
                                    else if (children.length === 0) {
                                        return false;
                                    }
                                    else {
                                        return _.some(children, function (childID) {
                                            return isTaskIsChildOf(taskID, _diagram.nodes[childID], isInBranch);
                                        });
                                    }
                                }(currentTaskID, data.node)))) {
                            _shouldGoBack_1 = true;
                        }
                    }
                    _this._postService.publish(_.assign({}, messages_1.SUB_EVENTS.deleteTask, {
                        data: {
                            node: data.node
                        },
                        done: function (diagram) {
                            delete _this.tasks[_.get(data, 'node.taskID', '')];
                            _.assign(_this.diagram, diagram);
                            _this._updateFlow(_this._flow);
                            _this._isDiagramEdited = true;
                            if (_shouldGoBack_1) {
                                _this._router.navigate([
                                    'FlogoFlowsDetailDefault'
                                ]);
                            }
                        }
                    }));
                }
            }).catch(function (err) {
                console.error(err);
            });
        }
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._addBranchFromDiagram = function (data, envelope) {
        var _this = this;
        console.group('Add branch message from diagram');
        console.log(data);
        var branchInfo = {
            id: utils_1.flogoGenBranchID(),
            type: constants_1.FLOGO_TASK_TYPE.TASK_BRANCH,
            condition: 'true'
        };
        this.tasks[branchInfo.id] = branchInfo;
        this._postService.publish(_.assign({}, messages_1.SUB_EVENTS.addBranch, {
            data: {
                node: data.node,
                task: branchInfo
            },
            done: function (diagram) {
                _.assign(_this.diagram, diagram);
                _this._updateFlow(_this._flow);
            }
        }));
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype._selectBranchFromDiagram = function (data, envelope) {
        var _this = this;
        console.group('Select branch message from diagram');
        console.log(data);
        var currentStep = this._getCurrentState(data.node.taskID);
        var currentTask = _.assign({}, _.cloneDeep(this.tasks[data.node.taskID]));
        var context = this._getCurrentContext(data.node.taskID);
        var selectedNode = data.node;
        var previousNodes = this.findPathToNode(this.diagram.root.is, selectedNode.id);
        previousNodes.pop();
        var previousTiles = this.mapNodesToTiles(previousNodes);
        this._router.navigate([
            'FlogoFlowsDetailTaskDetail',
            { id: data.node.taskID }
        ])
            .then(function () {
            console.group('after navigation');
            _this._postService.publish(_.assign({}, messages_4.SUB_EVENTS.selectTask, {
                data: _.assign({}, data, { task: currentTask }, { step: currentStep }, {
                    context: _.assign(context, {
                        contextData: {
                            previousTiles: previousTiles
                        }
                    })
                }),
                done: function () {
                    _this._postService.publish(_.assign({}, messages_1.SUB_EVENTS.selectTask, {
                        data: {
                            node: data.node,
                            task: _this.tasks[data.node.taskID]
                        },
                        done: function (diagram) {
                            _.assign(_this.diagram, diagram);
                        }
                    }));
                }
            }));
            console.groupEnd();
        });
        console.groupEnd();
    };
    FlogoCanvasComponent.prototype.uniqueTaskName = function (taskName) {
        var newNormalizedName = utils_1.normalizeTaskName(taskName);
        var greatestIndex = _.reduce(this.tasks, function (greatest, task) {
            var currentNormalized = utils_1.normalizeTaskName(task.name);
            var repeatIndex = 0;
            if (newNormalizedName == currentNormalized) {
                repeatIndex = 1;
            }
            else {
                var match = /^(.*)\-([0-9]+)$/.exec(currentNormalized);
                if (match && match[1] == newNormalizedName) {
                    repeatIndex = _.toInteger(match[2]);
                }
            }
            return repeatIndex > greatest ? repeatIndex : greatest;
        }, 0);
        return greatestIndex > 0 ? taskName + " (" + (greatestIndex + 1) + ")" : taskName;
    };
    FlogoCanvasComponent.prototype.findPathToNode = function (startNodeId, targetNodeId) {
        var nodes = this.diagram.nodes;
        var queue = [[startNodeId]];
        var _loop_1 = function() {
            var path = queue.shift();
            var nodeId = path[path.length - 1];
            if (nodeId == targetNodeId) {
                return { value: path };
            }
            var children = nodes[nodeId].children;
            if (children) {
                var paths = children.map(function (child) { return path.concat(child); });
                queue = queue.concat(paths);
            }
        };
        while (queue.length > 0) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object") return state_1.value;
        }
        return [];
    };
    FlogoCanvasComponent.prototype.mapNodesToTiles = function (nodeIds) {
        var _this = this;
        return nodeIds
            .map(function (nodeId) {
            var node = _this.diagram.nodes[nodeId];
            if (node.type == constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE || node.type == constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT) {
                return _this.tasks[node.taskID];
            }
            else {
                return null;
            }
        })
            .filter(function (task) { return !!task; });
    };
    FlogoCanvasComponent.prototype._updateAttributesChanges = function (task, changedInputs, structure) {
        for (var name in changedInputs) {
            var attributes = _.get(task, structure, []);
            attributes.forEach(function (input) {
                if (input.name === name) {
                    input['value'] = changedInputs[name];
                }
            });
        }
    };
    FlogoCanvasComponent.prototype._taskDetailsChanged = function (data, envelope) {
        var _this = this;
        console.group('Save task details to flow');
        var task = this.tasks[data.taskId];
        if (task.type === constants_1.FLOGO_TASK_TYPE.TASK) {
            _.set(task, '__props.warnings', data.warnings);
            var changedInputs = data.inputs || {};
            this._updateAttributesChanges(task, changedInputs, 'attributes.inputs');
        }
        else if (task.type === constants_1.FLOGO_TASK_TYPE.TASK_ROOT) {
            this._updateAttributesChanges(task, data.settings, 'settings');
            this._updateAttributesChanges(task, data.endpointSettings, 'endpoint.settings');
            this._updateAttributesChanges(task, data.outputs, 'outputs');
            task.__props = task.__props || {};
            task.__props['outputs'] = _.map(_.get(task, 'outputs', []), function (output) {
                var newValue = data.outputs[output.name];
                if (output && !_.isUndefined(newValue)) {
                    output.value = newValue;
                }
                return output;
            });
        }
        else if (task.type === constants_1.FLOGO_TASK_TYPE.TASK_BRANCH) {
            task.condition = data.condition;
        }
        if (_.isFunction(envelope.done)) {
            envelope.done();
        }
        this._updateFlow(this._flow).then(function () {
            _this._postService.publish(messages_1.SUB_EVENTS.render);
        });
        console.groupEnd();
    };
    FlogoCanvasComponent = __decorate([
        core_1.Component({
            selector: 'flogo-canvas',
            moduleId: module.id,
            directives: [router_deprecated_1.RouterOutlet, components_1.FlogoFlowsDetailDiagramComponent, transform_component_1.TransformComponent, contenteditable_directive_1.Contenteditable],
            template: "<div *ngIf=\"!_mockLoading\" [ngClass]=\"{'flogo-canvas-maximum': isOnDefaultRoute()}\">   <div class=\"canvas-flow\">     <section class=\"flogo-flow-detail\">       <header class=\"flogo-flow-detail-header col-sm-10\">         <h3 class=\"flogo-flow-detail-name\" [(myContenteditable)]=\"_flow.name\" (myContenteditableChange)=\"changeFlowDetail($event, 'name')\"></h3>         <p class=\"flogo-flow-detail-description\" [(myContenteditable)]=\"_flow.description\" placeholder=\"Add flow's description\" (myContenteditableChange)=\"changeFlowDetail($event, 'descrption')\"></p>       </header>       <div class=\"col-sm-2\">         <div class=\"flogo-flow-detail-menu\">           <div class=\"flogo-flow-detail-menu-list-wrapper\">             <ul class=\"flogo-flow-detail-menu-list\">               <li class=\"flogo-flow-detail-menu-item\"><i class=\"fa fa-pencil fa-fw\"></i>                 <a [href]=\"downloadLink\" download>Build</a>                 <ul class=\"flogo-flow-detail-menu-item-choices\">                   <li class=\"flogo-flow-detail-menu-item-choice\"><label class=\"flogo-flow-detail-menu-item-choice-text\"><input type=\"checkbox\" disabled/><span>ARM/Linux</span></label></li>                   <li class=\"flogo-flow-detail-menu-item-choice\"><label class=\"flogo-flow-detail-menu-item-choice-text\"><input type=\"checkbox\" disabled/><span>x86/Linux</span></label></li>                   <li class=\"flogo-flow-detail-menu-item-choice\"><label class=\"flogo-flow-detail-menu-item-choice-text\"><input type=\"checkbox\" checked=\"checked\"/><span>Darwin/OSX</span></label></li>                 </ul>               </li>               <li class=\"flogo-flow-detail-menu-item\"><i class=\"fa fa-clone fa-fw\"></i><a href=\"javascript:void(0);\">Make a copy</a></li>               <li class=\"flogo-flow-detail-menu-item\"><a [href]=\"exportLink\" download><i class=\"fa fa-cloud-download fa-fw\"></i>Export JSON</a></li>               <li class=\"flogo-flow-detail-menu-item\"><i class=\"fa fa-trash fa-fw\"></i><a href=\"javascript:void(0);\">Delete</a></li>             </ul>           </div>         </div>       </div>     </section>     <!--<flogo-canvas-flow id=\"211\"></flogo-canvas-flow>-->     <flogo-canvas-flow-diagram [tasks]=\"tasks\" [diagram]=\"diagram\"></flogo-canvas-flow-diagram>      <flogo-transform></flogo-transform>      <!-- the mock section below should be removed later-->     <section class=\"container-fluid\" style=\"display: none; width: 100%;\">       <section class=\"row\">         <header>           <h3>Mock Area in Canvas component</h3>           <button type=\"button\" class=\"btn btn-default\" (click)=\"MOCK=!MOCK\">Display</button>         </header>       </section>        <section class=\"row\" [hidden]=\"!MOCK\">         <div class=\"col-xs-12\">           <header><h4>Actions</h4></header>         </div>          <div class=\"col-xs-12\">           <button type=\"button\" class=\"btn btn-warning\" (click)=\"uploadProcess()\"                   [disabled]=\"_uploadingProcess\">Upload process           </button>           <button type=\"button\" class=\"btn btn-default\" (click)=\"startAndMonitorProcess()\"                   [disabled]=\"_startingProcess\" [hidden]=\"!_hasUploadedProcess\">Start process           </button>           <button type=\"button\" class=\"btn btn-default\" (click)=\"mockGetSteps()\"                   [disabled]=\"_mockGettingStepsProcess\" [hidden]=\"!_hasUploadedProcess\">Get steps           </button>         </div>        </section>        <section class=\"row\" [hidden]=\"!MOCK || !_steps\">          <div class=\"col-xs-12\">           <header>             <h4>Steps</h4>           </header>         </div>          <div class=\"col-xs-12\">           <!-- TODO: replace [innerHTML] with [textContent] https://github.com/angular/angular/issues/8413 -->           <pre><code [innerHTML]=\"_steps | json\"></code></pre>         </div>        </section>        <section class=\"row\" [hidden]=\"!MOCK\">          <div class=\"col-xs-12\">           <header>             <h4>Process.json</h4>           </header>         </div>          <div class=\"col-xs-12\">           <!-- TODO: replace [innerHTML] with [textContent] https://github.com/angular/angular/issues/8413 -->           <pre><code [innerHTML]=\"_mockProcess | json\"></code></pre>         </div>        </section>     </section>   </div>   <div class=\"canvas-right-container\">     <router-outlet></router-outlet>   </div> </div>  <div *ngIf=\"_mockLoading\" class=\"flogo-spin-loading-bg\">   <div class=\"flogo-spin-loading\">     <div>       <div></div>     </div>     <div>       <div></div>     </div>     <div>       <div></div>     </div>     <div>       <div></div>     </div>     <div>       <div></div>     </div>     <div>       <div></div>     </div>     <div>       <div></div>     </div>     <div>       <div></div>     </div>   </div> </div>",
            styles: [":host {   display: flex;   align-items: stretch;   width: 100%;   flex-grow: 2; } :host > div {   display: flex;   align-items: stretch;   width: 100%; } .canvas-flow {   display: flex;   width: 77.5%;   flex-direction: column;   z-index: 1;   /*overflow: auto;*/ } .canvas-right-container {   display: flex;   width: 22.5%;   min-width: 321px;   flex-direction: column;   border-left: solid 1px #B5B5B5;   background: #fff;   position: relative; } .flogo-flow-detail {   background-color: #FAFAFA; } .flogo-flow-detail-header {   padding: 20px 0 30px 30px; } .flogo-flow-detail-name {   font-size: 24px;   color: #666666;   margin: 0;   line-height: 1.5; } .flogo-flow-detail-description {   font-size: 15px;   line-height: 1.5;   color: rgba(102, 102, 102, 0.7);   margin-top: 5px;   margin-bottom: 0;   word-wrap: break-word;   word-break: break-all; } .flogo-flow-detail-menu {   height: 43px;   width: 29px;   margin-right: 15px;   margin-top: 36px;   float: right;   position: relative;   background: url(\"/assets/svg/flogo.flows.detail.menu.icon.svg\") left top no-repeat; } .flogo-flow-detail-menu:hover, .flogo-flow-detail-menu:active {   background: url(\"/assets/svg/flogo.flows.detail.menu.hover.icon.svg\") left top no-repeat; } .flogo-flow-detail-menu:hover .flogo-flow-detail-menu-list-wrapper, .flogo-flow-detail-menu:active .flogo-flow-detail-menu-list-wrapper {   width: 200px; } .flogo-flow-detail-menu:hover .flogo-flow-detail-menu-list, .flogo-flow-detail-menu:active .flogo-flow-detail-menu-list {   transform: translate(0, 0);   opacity: 1; } .flogo-flow-detail-menu .flogo-flow-detail-menu-list-wrapper {   position: absolute;   z-index: 10;   top: 11px;   left: 20px;   overflow: hidden;   width: 0;   transition: all 300ms linear; } .flogo-flow-detail-menu .flogo-flow-detail-menu-list {   opacity: 0;   width: 200px;   margin: 0;   padding: 0;   border-radius: 2px;   background-color: #ffffff;   box-shadow: 0 2px 4px 0 rgba(199, 199, 199, 0.5);   transform: translate(-100%, -100%);   border: solid 1px #727272;   transition: all 300ms linear; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item {   padding: 6px 15px;   margin: 0;   list-style: none;   font-size: 18px;   color: #727272;   cursor: pointer; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item a {   color: #727272; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item a:hover {   color: #666; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item:hover {   background: #ececec; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item i {   margin-right: 5px; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item-choices {   margin: 0; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item-choice {   margin-top: 2px;   list-style: none; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item-choice-text {   margin: 0;   cursor: pointer;   font-size: 16px;   position: relative; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item-choice-text:hover {   color: #666; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item-choice-text:hover:hover {   border-color: #666; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item-choice-text:before {   content: '';   display: inline-block;   border: 1px solid #8493a8;   width: 12px;   height: 12px;   border-radius: 2px;   margin-right: 3px;   cursor: pointer;   vertical-align: middle; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item-choice-text input[type=\"checkbox\"] {   display: none; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item-choice-text input[type=\"checkbox\"]:checked + span:after {   opacity: 1; } .flogo-flow-detail-menu .flogo-flow-detail-menu-item-choice-text span:after {   content: '';   position: absolute;   left: 1px;   top: 8px;   width: 11px;   height: 7px;   border: 3px solid #0081cb;   border-top: none;   border-right: none;   opacity: 0;   transform: rotate(-45deg); }"],
            providers: [modal_service_1.FlogoModal]
        }),
        router_deprecated_1.RouteConfig([
            { path: '/', name: 'FlogoFlowsDetailDefault', component: flow_detail_component_1.FlogoFlowsDetail, useAsDefault: true },
            { path: '/trigger/add', name: 'FlogoFlowsDetailTriggerAdd', component: triggers_component_1.FlogoFlowsDetailTriggers },
            { path: '/trigger/:id', name: 'FlogoFlowsDetailTriggerDetail', component: detail_component_1.FlogoFlowsDetailTriggersDetail },
            { path: '/task/add', name: 'FlogoFlowsDetailTaskAdd', component: tasks_component_1.FlogoFlowsDetailTasks },
            { path: '/task/:id', name: 'FlogoFlowsDetailTaskDetail', component: detail_component_2.FlogoFlowsDetailTasksDetail }
        ]), 
        __metadata('design:paramtypes', [post_service_1.PostService, rest_api_service_1.RESTAPIService, flows_api_service_1.RESTAPIFlowsService, router_deprecated_1.RouteParams, router_deprecated_1.Router, modal_service_1.FlogoModal])
    ], FlogoCanvasComponent);
    return FlogoCanvasComponent;
}());
exports.FlogoCanvasComponent = FlogoCanvasComponent;
