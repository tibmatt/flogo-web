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
var Rx_1 = require('rxjs/Rx');
var messages_1 = require('../messages');
var fields_radio_component_1 = require('../../flogo.form-builder.fields/components/fields.radio/fields.radio.component');
var fields_textbox_component_1 = require('../../flogo.form-builder.fields/components/fields.textbox/fields.textbox.component');
var fields_textarea_component_1 = require('../../flogo.form-builder.fields/components/fields.textarea/fields.textarea.component');
var fields_number_component_1 = require('../../flogo.form-builder.fields/components/fields.number/fields.number.component');
var utils_1 = require("../../../common/utils");
var contenteditable_directive_1 = require('../../../common/directives/contenteditable.directive');
var form_builder_configuration_trigger_component_1 = require('../../flogo.form-builder.configuration.trigger/components/form-builder.configuration.trigger.component');
var form_builder_configuration_task_component_1 = require('../../flogo.form-builder.configuration.task/components/form-builder.configuration.task.component');
var form_builder_configuration_branch_component_1 = require('../../flogo.form-builder.configuration.branch/components/form-builder.configuration.branch.component');
var FlogoFormBuilderComponent = (function () {
    function FlogoFormBuilderComponent(_postService) {
        this._postService = _postService;
        this._canRunFromThisTile = false;
        this._hasChanges = false;
        this._initSubscribe();
        this._setFieldsObservers();
    }
    FlogoFormBuilderComponent.prototype._initSubscribe = function () {
        var _this = this;
        this._subscriptions = [];
        _.each(function (subs, sub) {
            _this._subscriptions.push(_this._postService.subscribe(sub));
        });
    };
    FlogoFormBuilderComponent.prototype.ngOnDestroy = function () {
        var _this = this;
        if (this._hasChanges) {
            this._saveChangesToFlow();
        }
        _.each(this._subscriptions, function (sub) {
            _this._postService.unsubscribe(sub);
        });
    };
    FlogoFormBuilderComponent.prototype._saveActivityChangesToFlow = function () {
        var _this = this;
        var state = {
            taskId: this._task.id,
            warnings: []
        };
        if (this._context.isTask) {
            state['inputs'] = this._getCurrentTaskState(this._attributes.inputs);
            state['warnings'] = this.verifyRequiredFields(this._task);
        }
        if (this._context.isTrigger) {
            state['endpointSettings'] = this._getCurrentTaskState(this._attributes.endpointSettings || []);
            state['outputs'] = this._getCurrentTaskState(this._attributes.outputs || []);
            state['settings'] = this._getCurrentTaskState(this._attributes.settings || []);
        }
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.taskDetailsChanged, {
            data: state,
            done: function () {
                _this._hasChanges = false;
            }
        }));
    };
    FlogoFormBuilderComponent.prototype._saveBranchChangesToFlow = function () {
        var _this = this;
        var self = this;
        var branchInfo = this._branchConfigs[0];
        var state = {
            taskId: branchInfo.id,
            condition: self.convertBranchConditionToInternal(branchInfo.condition, _.get(self, '_context.contextData.previousTiles', []))
        };
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.taskDetailsChanged, {
            data: state,
            done: function () {
                _this._hasChanges = false;
            }
        }));
    };
    FlogoFormBuilderComponent.prototype._setFieldsObservers = function () {
        var _this = this;
        this._fieldObserver = new Rx_1.ReplaySubject(2);
        this._fieldObserver.filter(function (param) {
            return param.message == 'validation' && param.payload.status == 'error';
        }).
            subscribe(function (param) {
            if (_this._fieldsErrors.indexOf(param.payload.field) == -1) {
                _this._fieldsErrors.push(param.payload.field);
            }
        });
        this._fieldObserver.filter(function (param) {
            return param.message == 'validation' && param.payload.status == 'ok';
        }).
            subscribe(function (param) {
            var index = _this._fieldsErrors.indexOf(param.payload.field);
            if (index != -1) {
                _this._fieldsErrors.splice(index, 1);
            }
        });
        this._fieldObserver.filter(function (param) {
            return param.message == 'change-field';
        }).
            subscribe(function (param) {
            _this._hasChanges = true;
            if (param.payload.isTask || param.payload.isTrigger) {
                _this._updateAttributeByUserChanges(_.get(_this._attributes, param.payload.structure, []), param.payload);
            }
        });
        this._fieldObserver.filter(function (param) {
            return param.message == 'change-field' && param.payload.isBranch && param.payload.name === 'condition';
        })
            .subscribe(function (param) {
            _this._branchConfigs[0].condition = param.payload.value;
        });
    };
    FlogoFormBuilderComponent.prototype._updateAttributeByUserChanges = function (attributes, changedObject) {
        var item = _.find(attributes, function (field) {
            return field.name === changedObject.name;
        });
        if (item) {
            item.value = changedObject.value;
        }
    };
    FlogoFormBuilderComponent.prototype.ngOnChanges = function () {
        this._setupEnvironment();
    };
    FlogoFormBuilderComponent.prototype.verifyRequiredFields = function (task) {
        var warnings = [];
        _.some(_.get(this._task, 'attributes.inputs'), function (input) {
            if (input.required && (_.isNil(input.value)
                || (_.isString(input.value) && _.isEmpty(input.value)))) {
                warnings.push({ msg: 'Configure Required' });
                return true;
            }
            return false;
        });
        return warnings;
    };
    FlogoFormBuilderComponent.prototype._setTaskWarnings = function () {
        var taskId = this._task.id;
        var warnings = this.verifyRequiredFields(this._task);
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.setTaskWarnings, {
            data: { warnings: warnings, taskId: taskId },
            done: function () { }
        }));
    };
    FlogoFormBuilderComponent.prototype._setupEnvironment = function () {
        var _this = this;
        this._fieldsErrors = [];
        if (!this._context) {
            this._context = { isTrigger: false, isTask: false, isBranch: false, hasProcess: false, _isDiagramEdited: false };
        }
        this._canRunFromThisTile = this._getCanRunFromThisTile();
        if (this._context.isTrigger) {
            var attributes = {};
            var task = this._task || {};
            attributes['endpointSettings'] = this._getArray(_.get(task, 'endpoint.settings', []));
            attributes['outputs'] = this._getArray(_.get(task, 'outputs', []));
            attributes['settings'] = this._getArray(task['settings'] || []);
            this._attributesOriginal = _.cloneDeep(attributes);
            this._setTriggerEnvironment(attributes);
            return;
        }
        if (this._context.isTask) {
            var attributes = this._task ? this._task.attributes || {} : {};
            this._attributesOriginal = _.cloneDeep(attributes);
            this._setTaskEnvironment(attributes);
            setTimeout(function () {
                _this._setTaskWarnings();
            }, 1000);
            return;
        }
        if (this._context.isBranch) {
            this._setBranchEnvironment(this._task);
        }
    };
    FlogoFormBuilderComponent.prototype._getCanRunFromThisTile = function () {
        if (this._context.isTrigger) {
            return true;
        }
        if (this._context.isDiagramEdited) {
            return false;
        }
        return this._context.hasProcess;
    };
    FlogoFormBuilderComponent.prototype._setTriggerEnvironment = function (attributes) {
        this._attributes = attributes;
    };
    FlogoFormBuilderComponent.prototype._setTaskEnvironment = function (attributes) {
        var _this = this;
        this._attributes = { inputs: attributes['inputs'] || [], outputs: attributes['outputs'] || [] };
        this._attributes.inputs.map(function (input) { input.mappings = _this._task.inputMappings; input.step = _this._step; });
        this._attributes.outputs.map(function (output) { output.mappings = _this._task.outputMappings; output.step = _this._step; });
    };
    FlogoFormBuilderComponent.prototype._setBranchEnvironment = function (branchInfo) {
        var self = this;
        this._branchConfigs = [
            _.assign({}, {
                id: branchInfo.id,
                condition: self.convertBranchConditionToDisplay(branchInfo.condition, _.get(self, '_context.contextData.previousTiles', []))
            })
        ];
    };
    FlogoFormBuilderComponent.prototype._getArray = function (obj) {
        if (!Array.isArray(obj)) {
            return [];
        }
        return obj;
    };
    FlogoFormBuilderComponent.prototype.runFromThisTile = function () {
        var _this = this;
        var taskId = this._task.id;
        var inputs = (this._context.isTrigger) ? {} : this._getCurrentTaskState(this._attributes.inputs);
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.runFromThisTile, {
            data: { inputs: inputs, taskId: taskId },
            done: function () {
                _this._hasChanges = false;
            }
        }));
    };
    FlogoFormBuilderComponent.prototype.runFromTrigger = function () {
        var taskId = this._task.id;
        var inputs = (this._context.isTrigger) ? {} : this._getCurrentTaskState(this._attributes.inputs);
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.runFromTrigger, {
            data: { inputs: inputs, taskId: taskId }
        }));
    };
    FlogoFormBuilderComponent.prototype._getCurrentTaskState = function (items) {
        var result = {};
        items = this._getArray(items);
        items.forEach(function (item) {
            result[item.name] = _.get(item, 'value', utils_1.getDefaultValue(item.type));
        });
        return result;
    };
    FlogoFormBuilderComponent.prototype.cancelEdit = function (event) {
        if (this._context.isTrigger) {
            this._setTriggerEnvironment(_.cloneDeep(this._attributesOriginal));
        }
        if (this._context.isTask) {
            this._setTaskEnvironment(_.cloneDeep(this._attributesOriginal || {}));
        }
        if (this._context.isBranch) {
            this._setBranchEnvironment(this._task || {});
        }
        this._fieldsErrors = [];
        this._hasChanges = false;
    };
    FlogoFormBuilderComponent.prototype._saveChangesToFlow = function () {
        if (this._context.isTask || this._context.isTrigger) {
            this._saveActivityChangesToFlow();
        }
        else if (this._context.isBranch) {
            this._saveBranchChangesToFlow();
        }
    };
    FlogoFormBuilderComponent.prototype.saveChanges = function (event) {
        this._saveChangesToFlow();
    };
    FlogoFormBuilderComponent.prototype.changeTaskDetail = function (content, proper) {
        console.log(content);
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.changeTileDetail, {
            data: { content: content, proper: proper, taskId: this._task.id }
        }));
    };
    FlogoFormBuilderComponent.prototype.convertBranchConditionToDisplay = function (condition, tiles) {
        condition = '' + condition;
        var reComTriggerLabel = '(T)';
        var reComActivityLabel = '(A)(\\d+)';
        var reComTaskLabel = "(" + reComTriggerLabel + "|" + reComActivityLabel + ")";
        var reComPropNameWithoutQuote = '(?:\\$|\\w)+';
        var reProp = "(?:\\$\\{" + reComTaskLabel + "(\\." + reComPropNameWithoutQuote + ")?\\})((?:\\." + reComPropNameWithoutQuote + ")*)";
        var pattern = new RegExp(reProp.replace(/\s/g, ''), 'g');
        var taskIDNameMappings = {};
        _.each(tiles, function (tile) {
            if (tile.triggerType) {
                taskIDNameMappings['T'] = {
                    name: utils_1.normalizeTaskName(tile.name),
                    triggerType: tile.triggerType,
                    activityType: tile.activityType
                };
            }
            else {
                taskIDNameMappings['A' + utils_1.convertTaskID(tile.id)] = {
                    name: utils_1.normalizeTaskName(tile.name),
                    triggerType: tile.triggerType,
                    activityType: tile.activityType
                };
            }
        });
        condition = condition.replace(pattern, function (match, taskLabel, triggerTypeLabel, activityTypeLabel, taskID, taskLabelProp, propPath, offset, wholeString) {
            var taskInfo = taskIDNameMappings[taskLabel];
            if (taskInfo) {
                var labelProp = _['toPath'](taskLabelProp).join('.');
                var props = _['toPath'](propPath).join('.');
                if (labelProp) {
                    return props ? taskInfo.name + "." + labelProp + "." + props : taskInfo.name + "." + labelProp;
                }
                else {
                    return "" + taskInfo.name;
                }
            }
            else {
                return match;
            }
        });
        return condition;
    };
    FlogoFormBuilderComponent.prototype.convertBranchConditionToInternal = function (condition, tiles) {
        condition = '' + condition;
        var reComTaskName = '\\w+(?:\\-|\\w)*';
        var reComPropNameWithoutQuote = '(?:\\$|\\w)+';
        var reComPropNameWithQuote = '(?:[\\$\\-]|\\w)+';
        var reProp = "(" + reComTaskName + ")\n    ((?:\n      (?:\\." + reComPropNameWithoutQuote + ") |\n      (?:\\[\n        (?:\n          (?:\\\"" + reComPropNameWithQuote + "\\\") |\n          (?:\\'" + reComPropNameWithQuote + "\\')\n        )\\]\n      )\n    )+)";
        var pattern = new RegExp(reProp.replace(/\s/g, ''), 'g');
        var taskNameIDMappings = {};
        _.each(tiles, function (tile) {
            taskNameIDMappings[utils_1.normalizeTaskName(tile.name)] = {
                id: utils_1.convertTaskID(tile.id),
                triggerType: tile.triggerType,
                activityType: tile.activityType
            };
        });
        condition = condition.replace(pattern, function (match, taskName, propPath, offset, wholeString) {
            var taskInfo = taskNameIDMappings[utils_1.normalizeTaskName(taskName)];
            if (taskInfo) {
                taskName = taskInfo.activityType ? "A" + taskInfo.id : "T";
                var _propPath = _['toPath'](propPath);
                var firstProp = _propPath.shift();
                if (firstProp) {
                    return _propPath.length ?
                        "${" + taskName + "." + firstProp + "}." + _propPath.join('.') :
                        "${" + taskName + "." + firstProp + "}";
                }
                else {
                    return "${" + taskName + "}";
                }
            }
            else {
                return match;
            }
        });
        return condition;
    };
    FlogoFormBuilderComponent = __decorate([
        core_1.Component({
            selector: 'flogo-form-builder',
            moduleId: module.id,
            styles: [".flogo-form-builder {   display: flex;   flex-direction: column;   background-color: #fff; } .flogo-task-container {   display: flex;   flex-direction: column; } .flogo-task-container .flogo-task-container__input, .flogo-task-container .flogo-task-container__output {   padding-left: 15px;   padding-right: 15px; } .flogo-task-container .flogo-task-container__footer {   background-color: #f8f8f8;   border-top: 1px solid #b5b5b5;   color: #666;   margin-top: 10px;   min-height: 83px;   padding: 19px 16px;   width: 100%; } .flogo-common-edit-panel__head.flogo-common-edit-panel__head-branch {   background: #8a90ae; } .flogo-common-edit-panel__head-wrapper .trigger:before, .flogo-common-edit-panel__head-wrapper .task:before, .flogo-common-edit-panel__head-wrapper .branch:before {   float: left;   margin-right: 15px;   content: \"\"; } .flogo-common-edit-panel__head-wrapper .trigger {   padding-top: 21px;   padding-bottom: 6px; } .flogo-common-edit-panel__head-wrapper .trigger:before {   background: url(\"/assets/svg/flogo.flows.detail.diagram.trigger.icon.svg\") no-repeat left bottom / 46px 46px;   width: 46px;   height: 54px; } .flogo-common-edit-panel__head-wrapper .trigger .flogo-common-edit-panel__head-read-detail:before {   background: url(\"/assets/svg/flogo.flows.detail.diagram.trigger.icon.svg\") no-repeat center / 46px; } .flogo-common-edit-panel__head-wrapper .task {   padding-top: 21px;   padding-bottom: 6px; } .flogo-common-edit-panel__head-wrapper .task:before {   background: url(\"/assets/svg/flogo.icon.gears.circle.svg\") no-repeat left bottom / 40px 40px;   width: 40px;   height: 50px; } .flogo-common-edit-panel__head-wrapper .task .flogo-common-edit-panel__head-read-detail:before {   background: url(\"/assets/svg/flogo.icon.gears.circle.svg\") no-repeat center / 46px 46px; } .flogo-common-edit-panel__head-wrapper .branch {   padding-top: 33px; } .flogo-common-edit-panel__head-wrapper .branch:before {   background: #fff url(\"/assets/svg/flogo.flows.detail.add.cross.gray.icon.svg\") no-repeat center / 50%;   width: 40px;   height: 40px;   border-radius: 50%; } .flogo-common-edit-panel__head-wrapper .branch.change {   padding-top: 30px;   padding-bottom: 10px; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-title, .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-subtitle {   margin-right: 20px;   overflow: hidden;   text-overflow: ellipsis;   white-space: nowrap; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-titles {   margin-left: 60px; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-subtitle {   margin-top: -3px;   font-size: 15px;   letter-spacing: 0.3px; } .flogo-common-edit-panel__head-wrapper button {   width: 140px;   height: 45px;   color: #fff;   margin-top: 14px;   margin-bottom: 14px;   outline: none; } .flogo-common-edit-panel__head-wrapper button.disabled {   cursor: not-allowed; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-primary-call {   background: #fe883b;   border: 1px solid #fff; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-primary-call:hover {   border-radius: 4px; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-primary-call:active {   border-radius: 4px;   background: #fff;   color: #fe883b; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-primary-call.disabled {   background: #ffc49d;   border: 1px solid rgba(255, 255, 255, 0.5); } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-primary-call.center {   display: block;   margin: 14px auto; } .flogo-common-edit-panel__head-wrapper .left {   float: left; } .flogo-common-edit-panel__head-wrapper .right {   float: right; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-primary {   background: #138ace;   border: 1px solid #fff; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-primary:hover {   border-radius: 4px; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-primary:active {   border-radius: 4px;   background: #fff;   color: #138ace; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-primary.disabled {   opacity: 0.4; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-secondary {   background: transparent;   border: 1px solid #fff; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-secondary:hover {   border-radius: 4px; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-secondary:active {   border-radius: 4px;   background: #fff;   color: #79b8dc; } .flogo-common-edit-panel__head-wrapper .flogo-form-builder-buttons-secondary.disabled {   background-color: rgba(255, 255, 255, 0.4);   border: solid 1px rgba(255, 255, 255, 0.5); } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read {   position: absolute;   top: 25px;   right: 14px;   width: 17px;   height: 17px; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read:hover .flogo-common-edit-panel__head-read-detail-wrapper {   width: 390px;   opacity: 1;   transition-delay: 0ms; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read:hover .flogo-common-edit-panel__head-read-detail {   transform: translate(0, 0);   transition-delay: 0ms; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-icon {   display: block;   height: 100%;   width: 100%;   background: url(\"/assets/svg/flogo.form-builder.info.icon.svg\") no-repeat; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-detail-wrapper {   position: absolute;   top: 0;   right: 27px;   z-index: 10;   width: 0;   overflow: hidden;   opacity: 0;   transition: all 300ms linear 200ms; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-detail {   padding: 0 20px 20px;   width: 100%;   border-radius: 2px;   background: #fff;   box-shadow: 0 2px 4px 0 rgba(199, 199, 199, 0.5);   border: solid 1px #727272;   color: #666;   transform: translate(100%, -100%);   transition: all 300ms linear 200ms; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-detail:before {   content: '';   float: left;   width: 46px;   height: 46px;   margin-top: 20px;   background-size: 46px; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-detail-close {   position: absolute;   top: 10px;   right: 10px;   color: #b5b5b5;   cursor: pointer; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-detail-close:hover {   color: #666; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-titles {   padding-left: 71px; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-titles .flogo-common-edit-panel__head-read-title, .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-titles .flogo-common-edit-panel__head-read-creator {   overflow: hidden;   text-overflow: ellipsis;   white-space: nowrap; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-titles .flogo-common-edit-panel__head-read-title {   letter-spacing: 0.4px;   margin-top: 30px; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-titles .flogo-common-edit-panel__head-read-title.up {   margin-top: 20px;   margin-bottom: 7px; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-titles .flogo-common-edit-panel__head-read-creator {   display: inline-block;   max-width: 277px;   font-size: 10px;   letter-spacing: 0.6px;   color: #666666; } .flogo-common-edit-panel__head-wrapper .flogo-common-edit-panel__head-read-titles .flogo-common-edit-panel__head-read-text {   font-size: 14px; }"],
            template: "<div class=\"flogo-common-edit-panel\">    <div [hidden]=\"hasErrors\">      <!-- PANEL HEADER -->     <div class=\"flogo-common-edit-panel__head\" [class.flogo-common-edit-panel__head-branch]=\"_context.isBranch\">       <div class=\"flogo-common-edit-panel__head-wrapper\">          <!-- PANEL TITLES -->         <div  *ngIf=\"_task && (_context.isTask || _context.isTrigger)\" [ngClass]=\"{trigger:_context.isTrigger, task: _context.isTask}\">           <div class=\"flogo-common-edit-panel__head-read\">             <a  class=\"flogo-common-edit-panel__head-read-icon\" [href]=\"_task.homepage? _task.homepage : 'javascript:;'\" target=\"_blank\"></a>             <div class=\"flogo-common-edit-panel__head-read-detail-wrapper\">               <div  class=\"flogo-common-edit-panel__head-read-detail\">                 <!--<i class=\"fa fa-times flogo-common-edit-panel__head-read-detail-close\" aria-hidden=\"true\"></i>-->                 <hgroup class=\"flogo-common-edit-panel__head-read-titles\">                   <!-- TODO: replace [innerHTML] with [textContent] https://github.com/angular/angular/issues/8413 -->                   <h3 [innerHTML]=\"_task.name\"  class=\"flogo-common-edit-panel__head-read-title\" [class.up]=\"_task.creator\"></h3>                   <span *ngIf=\"_task.creator\" [innerHTML]=\"'Created by ' + _task.creator\"  class=\"flogo-common-edit-panel__head-read-creator\"></span>                 </hgroup>                 <!-- TODO: replace [innerHTML] with [textContent] https://github.com/angular/angular/issues/8413 -->                 <p [innerHTML]=\"_task.readMe || _task.description\"  class=\"flogo-common-edit-panel__head-read-text\"></p>               </div>             </div>           </div>           <div class=\"flogo-common-edit-panel__head-titles\">             <h3 [(myContenteditable)]=\"_task.name\" class=\"flogo-common-edit-panel__head-title\" (myContenteditableChange)=\"changeTaskDetail($event, 'name')\"></h3>             <div class=\"flogo-common-edit-panel__head-subtitle\" [(myContenteditable)]=\"_task.description\" (myContenteditableChange)=\"changeTaskDetail($event, 'description')\"></div>           </div>         </div>          <div *ngIf=\"_context.isBranch\" class=\"branch\" [class.change]=\"_hasChanges\">           <h3 class=\"flogo-common-edit-panel__head-title\">Configure Branch</h3>         </div>         <!-- PANEL BUTTONS -->         <div *ngIf=\"_context.isTrigger\" class=\"clearfix\">           <button  class=\"flogo-form-builder-buttons-primary-call left\" [class.disabled]=\"!_canRunFromThisTile || _fieldsErrors.length\" [disabled]=\"!_canRunFromThisTile || _fieldsErrors.length\" [hidden]=\"_hasChanges\" (click)=\"runFromThisTile($event)\">             Run from Trigger           </button>           <button class=\"flogo-form-builder-buttons-primary left\" [hidden]=\"!_hasChanges\" (click)=\"saveChanges($event)\">Save</button>           <button class=\"flogo-form-builder-buttons-secondary right\" [hidden]=\"!_hasChanges\" (click)=\"cancelEdit($event)\">Cancel</button>         </div>          <div *ngIf=\"_context.isTask\" class=\"clearfix\">           <button  class=\"flogo-form-builder-buttons-primary-call left\" [class.disabled]=\"!_canRunFromThisTile || _fieldsErrors.length\" [disabled]=\"!_canRunFromThisTile || _fieldsErrors.length\" [hidden]=\"_hasChanges\" (click)=\"runFromThisTile($event)\">             Run from Tile           </button>           <button class=\"flogo-form-builder-buttons-primary right\" [hidden]=\"_hasChanges\" (click)=\"runFromTrigger($event)\">Run from Trigger</button>           <button class=\"flogo-form-builder-buttons-primary left\" [hidden]=\"!_hasChanges\" (click)=\"saveChanges($event)\">Save</button>           <button class=\"flogo-form-builder-buttons-secondary right\" [hidden]=\"!_hasChanges\" (click)=\"cancelEdit($event)\">Cancel</button>         </div>          <div *ngIf=\"_context.isBranch\" class=\"clearfix\">           <button [hidden]=\"!_hasChanges\"  class=\"flogo-form-builder-buttons-primary left\" (click)=\"saveChanges($event)\">             Save           </button>           <button [hidden]=\"!_hasChanges\" class=\"flogo-form-builder-buttons-secondary right\" (click)=\"cancelEdit($event)\">Cancel</button>         </div>       </div>     </div>       <div *ngIf=\"_context.isTrigger\">       <flogo-form-builder-trigger-configuration  [attributes]=\"_attributes\"  [fieldObserver]=\"_fieldObserver\"></flogo-form-builder-trigger-configuration>     </div>      <div *ngIf=\"_context.isTask\">       <flogo-form-builder-task-configuration     [attributes]=\"_attributes\"  [fieldObserver]=\"_fieldObserver\" [task]=\"_task\"></flogo-form-builder-task-configuration>     </div>      <div *ngIf=\"_context.isBranch\">       <flogo-form-builder-branch-configuration     [attributes]=\"_branchConfigs\"  [fieldObserver]=\"_fieldObserver\"></flogo-form-builder-branch-configuration>     </div>    </div>  </div>",
            directives: [router_deprecated_1.ROUTER_DIRECTIVES, fields_radio_component_1.FlogoFormBuilderFieldsRadio, fields_textbox_component_1.FlogoFormBuilderFieldsTextBox, fields_textarea_component_1.FlogoFormBuilderFieldsTextArea, fields_number_component_1.FlogoFormBuilderFieldsNumber, contenteditable_directive_1.Contenteditable, form_builder_configuration_trigger_component_1.FlogoFormBuilderConfigurationTriggerComponent, form_builder_configuration_task_component_1.FlogoFormBuilderConfigurationTaskComponent, form_builder_configuration_branch_component_1.FlogoFormBuilderConfigurationBranchComponent],
            inputs: ['_task:task', '_step:step', '_context:context']
        }), 
        __metadata('design:paramtypes', [post_service_1.PostService])
    ], FlogoFormBuilderComponent);
    return FlogoFormBuilderComponent;
}());
exports.FlogoFormBuilderComponent = FlogoFormBuilderComponent;
