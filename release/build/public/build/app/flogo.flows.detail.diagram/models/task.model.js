"use strict";
var constants_1 = require('../../../common/constants');
var utils_1 = require('../../../common/utils');
var FlogoFlowDiagramTask = (function () {
    function FlogoFlowDiagramTask(task) {
        this.update(task);
    }
    ;
    FlogoFlowDiagramTask.genTaskID = function () {
        return utils_1.flogoIDEncode('FlogoFlowDiagramTask::' + Date.now());
    };
    ;
    FlogoFlowDiagramTask.prototype.update = function (task) {
        if (!task) {
            task = {};
        }
        this.id = task.id || this.id || FlogoFlowDiagramTask.genTaskID();
        this.type = task.type || this.type || constants_1.FLOGO_TASK_TYPE.TASK;
        this.version = task.version || this.version || '';
        this.name = task.name || this.name || 'new task';
        this.description = task.description || this.description || '';
        this.title = task.title || this.title || '';
        this.activityType = task.activityType || this.activityType || '';
        this.triggerType = task.triggerType || this.triggerType || '';
        this.attributes = _.isEmpty(task.attributes) ?
            this.attributes || {} :
            _.cloneDeep(task.attributes);
        this.inputMappings = _.isEmpty(task.inputMappings) ? this.inputMappings || [] : _.cloneDeep(task.inputMappings);
        this.outputMappings = _.isEmpty(task.outputMappings) ?
            this.outputMappings || [] :
            _.cloneDeep(task.outputMappings);
        if (!_.isEmpty(task.tasks)) {
            this.tasks = _.cloneDeep(task.tasks);
        }
        if (!_.isEmpty(task.links)) {
            this.links = _.cloneDeep(task.links);
        }
        if (!_.isEmpty(task.__status)) {
            this.__status = _.cloneDeep(task.__status);
        }
    };
    ;
    return FlogoFlowDiagramTask;
}());
exports.FlogoFlowDiagramTask = FlogoFlowDiagramTask;
