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
var models_1 = require('../models');
var post_service_1 = require('../../../common/services/post.service');
var messages_1 = require('../messages');
var constants_1 = require('../constants');
var constants_2 = require('../../../common/constants');
var FlogoFlowsDetailDiagramComponent = (function () {
    function FlogoFlowsDetailDiagramComponent(elementRef, _postService) {
        this._postService = _postService;
        this._elmRef = elementRef;
        this.initSub();
    }
    FlogoFlowsDetailDiagramComponent.prototype.initSub = function () {
        var _this = this;
        if (_.isEmpty(this._subscriptions)) {
            this._subscriptions = [];
        }
        if (!this._postService) {
            console.error('No PostService Found..');
            return;
        }
        var subs = [
            _.assign({}, messages_1.SUB_EVENTS.addTrigger, { callback: this._addTriggerDone.bind(this) }),
            _.assign({}, messages_1.SUB_EVENTS.selectTrigger, { callback: this._selectTriggerDone.bind(this) }),
            _.assign({}, messages_1.SUB_EVENTS.addTask, { callback: this._addTaskDone.bind(this) }),
            _.assign({}, messages_1.SUB_EVENTS.selectTask, { callback: this._selectTaskDone.bind(this) }),
            _.assign({}, messages_1.SUB_EVENTS.deleteTask, { callback: this._deleteTaskDone.bind(this) }),
            _.assign({}, messages_1.SUB_EVENTS.render, {
                callback: function () {
                    this._diagram.render();
                }.bind(this)
            }),
            _.assign({}, messages_1.SUB_EVENTS.addBranch, { callback: this._addBranchDone.bind(this) }),
        ];
        _.each(subs, function (sub) {
            _this._subscriptions.push(_this._postService.subscribe(sub));
        });
    };
    FlogoFlowsDetailDiagramComponent.prototype.unsub = function () {
        var _this = this;
        if (_.isEmpty(this._subscriptions)) {
            return true;
        }
        _.each(this._subscriptions, function (sub) {
            _this._postService.unsubscribe(sub);
        });
        return true;
    };
    FlogoFlowsDetailDiagramComponent.prototype.ngAfterViewInit = function () {
        this._diagram = new models_1.FlogoFlowDiagram(this.diagram, this.tasks, this._elmRef.nativeElement);
        this._diagram.render();
    };
    FlogoFlowsDetailDiagramComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        console.log(changes);
        if (changes['diagram']) {
            console.groupCollapsed('Updated diagram');
            console.log(this.diagram);
            console.groupEnd();
            if (this.diagram && this.tasks && this._diagram) {
                this._diagram.updateAndRender({
                    tasks: this.tasks,
                    diagram: this.diagram
                })
                    .then(function (diagram) {
                    _this._diagram = diagram;
                });
            }
        }
        else if (changes['tasks']) {
            console.groupCollapsed('Updated tasks');
            console.log(this.tasks);
            console.groupEnd();
            if (this.diagram && this.tasks && this._diagram) {
                this._diagram.updateAndRender({
                    tasks: this.tasks
                })
                    .then(function (diagram) {
                    _this._diagram = diagram;
                });
            }
        }
    };
    FlogoFlowsDetailDiagramComponent.prototype._afterEditTaskHandler = function (data) {
        var _this = this;
        console.group('_afterEditTaskHandler');
        console.log(data);
        this._diagram.updateAndRender({
            tasks: this.tasks
        })
            .then(function (diagram) {
            _this._diagram = diagram;
        });
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent.prototype.ngOnDestroy = function () {
        this.unsub();
    };
    FlogoFlowsDetailDiagramComponent.prototype.addTask = function ($event) {
        console.group('forwarding add task event');
        console.log($event);
        var data = $event.detail;
        if (data.node.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW) {
            this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.addTrigger, { data: data }));
        }
        else if (data.node.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD) {
            this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.addTask, { data: data }));
        }
        else {
            console.warn('unknown event type');
        }
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent.prototype.selectTask = function ($event) {
        console.group('forwarding select task event');
        console.log($event);
        var data = $event.detail;
        if (data.node.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT) {
            this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.selectTrigger, { data: data }));
        }
        else if (data.node.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE) {
            this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.selectTask, { data: data }));
        }
        else if (data.node.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
            this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.selectBranch, { data: data }));
        }
        else {
            console.warn('unknown event type, yet');
        }
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent.prototype.onMenuItemClicked = function ($event) {
        console.group('forwarding menu item clicked event');
        var menuItemType = $event.detail.origEvent.target.getAttribute('data-menu-item-type');
        if (_.isEmpty(menuItemType)) {
            console.warn('Invalid data menu item type.');
        }
        else {
            var data = $event.detail;
            switch (Number(menuItemType)) {
                case constants_1.FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.ADD_BRANCH:
                    this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.addBranch, { data: data }));
                    break;
                case constants_1.FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.SELECT_TRANSFORM:
                    this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.selectTransform, { data: data }));
                    break;
                case constants_1.FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.DELETE:
                    this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.deleteTask, { data: data }));
                    break;
            }
        }
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent.prototype._addTriggerDone = function (data, envelope) {
        var _this = this;
        console.group('Add Trigger Done');
        console.log(data);
        console.log(envelope);
        this._associateNodeWithTaskAndUpdateDiagram(data)
            .then(function () {
            _.isFunction(envelope.done) && envelope.done(_this._diagram);
        })
            .then(function () {
            return _this._diagram.triggerByTaskID('selectTrigger', data.task.id);
        })
            .catch(function (err) {
            console.error(err);
        });
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent.prototype._addTaskDone = function (data, envelope) {
        var _this = this;
        console.group('Add Task Done');
        console.log(data);
        console.log(envelope);
        this._associateNodeWithTaskAndUpdateDiagram(data)
            .then(function () {
            _.isFunction(envelope.done) && envelope.done(_this._diagram);
        })
            .then(function () {
            return _this._diagram.triggerByTaskID('selectTask', data.task.id);
        })
            .catch(function (err) {
            console.error(err);
        });
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent.prototype._selectTriggerDone = function (data, envelope) {
        var _this = this;
        console.group('Select Trigger Done');
        console.log(data);
        console.log(envelope);
        this._associateNodeWithTaskAndUpdateDiagram(data)
            .then(function () {
            _.isFunction(envelope.done) && envelope.done(_this._diagram);
        });
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent.prototype._selectTaskDone = function (data, envelope) {
        var _this = this;
        console.group('Select task Done');
        console.log(data);
        console.log(envelope);
        this._associateNodeWithTaskAndUpdateDiagram(data)
            .then(function () {
            _.isFunction(envelope.done) && envelope.done(_this._diagram);
        });
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent.prototype._deleteTaskDone = function (data, envelope) {
        var _this = this;
        console.group('Delete task done.');
        console.log(data);
        console.log(envelope);
        var node = this._diagram.nodes[_.get(data, 'node.id', '')];
        if (node) {
            this._diagram.deleteNode(node)
                .then(function (diagram) {
                if (diagram && _.isFunction(diagram.render)) {
                    return _this._diagram.render();
                }
                else {
                    return diagram;
                }
            })
                .then(function (diagram) {
                _this._diagram = diagram;
                _.isFunction(envelope.done) && envelope.done(_this._diagram);
            });
        }
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent.prototype._associateNodeWithTaskAndUpdateDiagram = function (data) {
        var _this = this;
        if (data.node && data.task) {
            return this._diagram.linkNodeWithTask(data.node.id, data.task)
                .then(function (diagram) {
                return diagram.updateAndRender({
                    tasks: _this.tasks
                })
                    .then(function (diagram) {
                    _this._diagram = diagram;
                });
            });
        }
        if (data.task && data.task.type === constants_2.FLOGO_TASK_TYPE.TASK_ROOT) {
            return this._diagram.linkNodeWithTask(this._diagram.root.is, data.task)
                .then(function (diagram) {
                return diagram.updateAndRender({
                    tasks: _this.tasks
                })
                    .then(function (diagram) {
                    _this._diagram = diagram;
                });
            });
        }
        return Promise.reject('Invalid parameters.');
    };
    FlogoFlowsDetailDiagramComponent.prototype._addBranchDone = function (data, envelope) {
        var _this = this;
        console.group('Add branch done.');
        console.log(data);
        console.log(envelope);
        var node = this._diagram.nodes[_.get(data, 'node.id', '')];
        if (node &&
            (_.get(data, 'task.type', -1) === constants_2.FLOGO_TASK_TYPE.TASK_BRANCH) &&
            (_.get(data, 'node.type', ''))) {
            this._diagram.addBranch(data.node, data.task)
                .then(function (diagram) {
                return diagram.updateAndRender({
                    tasks: _this.tasks
                })
                    .then(function (diagram) {
                    _this._diagram = diagram;
                });
            })
                .then(function () {
                return _.isFunction(envelope.done) && envelope.done(_this._diagram);
            })
                .then(function () {
                return _this._diagram.triggerByTaskID('addTask', data.task.id);
            })
                .catch(function (err) {
                console.error(err);
            });
        }
        console.groupEnd();
    };
    FlogoFlowsDetailDiagramComponent = __decorate([
        core_1.Component({
            selector: 'flogo-canvas-flow-diagram',
            moduleId: module.id,
            template: "<div class=\"flogo-flows-detail-diagram\"      (flogoAddTask)=\"addTask($event)\"      (flogoSelectTask)=\"selectTask($event)\"      (flogoClickNodeMenuItem)=\"onMenuItemClicked($event)\"></div>",
            styles: ["@font-face {   font-family: SourceSansPro-Regular;   src: url('/assets/fonts/SourceSansPro-Regular.ttf'), url('/assets/fonts/SourceSansPro-Regular.eot');   font-weight: normal;   font-style: normal; } @font-face {   font-family: SourceSansPro-Bold;   src: url('/assets/fonts/SourceSansPro-Bold.ttf'), url('/assets/fonts/SourceSansPro-Bold.eot');   font-weight: normal;   font-style: normal; } @font-face {   font-family: SourceSansPro-Semibold;   src: url('/assets/fonts/SourceSansPro-Semibold.ttf');   font-weight: normal;   font-style: normal; } :host {   display: flex;   width: 100%;   flex-grow: 3;   overflow: auto;   background-color: #eeeded;   z-index: 1; } .flogo-flows-detail-diagram {   padding: 0;   margin: 0;   min-width: 100%;   transition: background-color 250ms linear;   white-space: pre-wrap; } .flogo-flows-detail-diagram-row {   border-radius: 4px;   min-width: 100%;   white-space: nowrap;   display: inline-block;   padding: 0 30px;   margin: 0;   position: relative;   width: 0;   z-index: 0; } .flogo-flows-detail-diagram-row:hover {   background-color: rgba(182, 217, 237, 0.2); } .flogo-flows-detail-diagram-row.flogo-flows-detail-diagram-row-selected {   z-index: 10000!important; } .flogo-flows-detail-diagram-node {   position: relative;   width: 112px;   height: 112px;   background: #fff;   border-radius: 10px;   white-space: normal;   font-family: SourceSansPro-Regular;   font-size: 12px;   line-height: 1;   letter-spacing: 1px;   color: #666666;   display: inline-block;   margin: 20px 5px;   text-align: center;   transition: all 250ms linear; } .flogo-flows-detail-diagram-node:first-of-type {   margin-left: 0; } .flogo-flows-detail-diagram-node:last-of-type {   margin-right: 0; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected {   transform: scale(1.1);   box-shadow: 0 5px 14px 0 rgba(0, 0, 0, 0.3);   z-index: 10;   border: none; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected .flogo-flows-detail-diagram-node-detail {   background: #79b8dc;   color: #fff; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected:before {   background: #79b8dc; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected[data-flogo-node-type=\"node_add\"], .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected[data-flogo-node-type=\"node_root_new\"] {   opacity: 1; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected[data-flogo-node-type=\"node_add\"]:before, .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected[data-flogo-node-type=\"node_root_new\"]:before {   background: #FE883B; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected[data-flogo-node-type=\"node_add\"] .flogo-flows-detail-diagram-node-detail, .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected[data-flogo-node-type=\"node_root_new\"] .flogo-flows-detail-diagram-node-detail {   background-color: #FE883B;   border: none; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected[data-flogo-node-type=\"node_add\"] .flogo-flows-detail-diagram-node-detail:before, .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected[data-flogo-node-type=\"node_root_new\"] .flogo-flows-detail-diagram-node-detail:before {   color: #FFF; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected.flogo-flows-detail-diagram-node-has-warn .flogo-flows-detail-diagram-node-detail-description {   font-family: SourceSansPro-Regular;   font-size: 10px;   color: #fff; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected.flogo-flows-detail-diagram-node-run:not([data-flogo-node-type=\"node_branch\"]):before {   background: #79b8dc; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-selected.flogo-flows-detail-diagram-node-run:not([data-flogo-node-type=\"node_branch\"]) .flogo-flows-detail-diagram-node-detail {   background: #79b8dc;   box-shadow: 0 1px 1.5px 0 rgba(0, 0, 0, 0.3); } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-run:before {   background: #def2fd; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-run .flogo-flows-detail-diagram-node-detail {   background: #def2fd;   box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.3); } .flogo-flows-detail-diagram-node:hover[data-flogo-node-type=\"node\"], .flogo-flows-detail-diagram-node:hover[data-flogo-node-type=\"node_root\"] {   z-index: 100; } .flogo-flows-detail-diagram-node:hover[data-flogo-node-type=\"node_branch\"] {   z-index: 100; } .flogo-flows-detail-diagram-node:hover[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-menu-gear {   opacity: 1; } .flogo-flows-detail-diagram-node:hover .flogo-flows-detail-diagram-node-menu {   width: 140px; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-menu:hover {   left: 103px;   background-color: #79b8dc;   border: 1px solid #79b8dc;   width: 162px;   transition-delay: 200ms; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-menu:hover .flogo-flows-detail-diagram-node-menu-box {   width: 118px;   transition-delay: 200ms; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-menu:hover {   left: 115px;   background-color: #79b8dc;   width: 142px; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-menu:hover .flogo-flows-detail-diagram-node-menu-box {   opacity: 1;   width: 98px; } .flogo-flows-detail-diagram-node:before {   position: absolute;   left: 93px;   top: 43px;   z-index: 3;   content: '';   display: block;   width: 34px;   height: 28px;   opacity: 1;   background: #FFF;   box-shadow: 1px -2px 1px 0 rgba(0, 0, 0, 0.1);   transform: rotate(63deg) skewX(35deg);   transition: all 250ms linear; } [data-flogo-node-type=\"node_add\"].flogo-flows-detail-diagram-node:before, [data-flogo-node-type=\"node_root_new\"].flogo-flows-detail-diagram-node:before {   opacity: 0; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_link\"] {   background-color: #F0AD4E;   color: #222; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] {   background-color: #B9C519;   color: #222; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root\"] .flogo-flows-detail-diagram-node-menu {   display: none; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_add\"], .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root_new\"], .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] {   transform: scale(0.63);   overflow: hidden; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_add\"] img, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root_new\"] img, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] img, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_add\"] .flogo-flows-detail-diagram-node-detail-title, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root_new\"] .flogo-flows-detail-diagram-node-detail-title, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] .flogo-flows-detail-diagram-node-detail-title, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_add\"] .flogo-flows-detail-diagram-node-detail-description, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root_new\"] .flogo-flows-detail-diagram-node-detail-description, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] .flogo-flows-detail-diagram-node-detail-description, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_add\"] .flogo-flows-detail-diagram-node-menu, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root_new\"] .flogo-flows-detail-diagram-node-menu, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] .flogo-flows-detail-diagram-node-menu, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_add\"] .flogo-flows-detail-diagram-node-badge, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root_new\"] .flogo-flows-detail-diagram-node-badge, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] .flogo-flows-detail-diagram-node-badge {   display: none; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"], .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_padding\"] {   opacity: 0; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"], .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_padding\"], .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] .flogo-flows-detail-diagram-node-menu, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_padding\"] .flogo-flows-detail-diagram-node-menu, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] .flogo-flows-detail-diagram-node-detail, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_padding\"] .flogo-flows-detail-diagram-node-detail {   cursor: default; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"]:before, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_padding\"]:before {   display: none; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_add\"], .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root_new\"] {   background-color: #fff;   box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);   opacity: 0; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_add\"] .flogo-flows-detail-diagram-node-detail:before, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root_new\"] .flogo-flows-detail-diagram-node-detail:before {   content: '+';   font-size: 88px;   line-height: 110px;   color: #b6d9ed; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] {   background-color: rgba(179, 214, 233, 0.9); } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] .flogo-flows-detail-diagram-node-detail {   background-color: rgba(179, 214, 233, 0.9);   z-index: 4; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_root_new\"] {   opacity: 1;   cursor: pointer; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-detail {   position: absolute;   top: 0;   left: 0;   z-index: 2;   box-shadow: 0 1px 1.5px 0 rgba(0, 0, 0, 0.3);   border-radius: 10px;   background: #fff;   width: 100%;   height: 100%;   padding: 0 5px;   transition: all 250ms linear;   cursor: pointer; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-detail .flogo-flows-detail-diagram-node-detail-icon {   margin: 14px 0 13px;   width: 30px; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-detail-title {   font-family: SourceSansPro-Bold;   font-weight: 600;   padding-bottom: 10px;   letter-spacing: .4px;   max-width: 90%;   white-space: nowrap;   text-overflow: ellipsis;   overflow: hidden;   margin: auto; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-detail-description {   font-size: 10px;   line-height: 1.1;   max-width: 90%;   white-space: nowrap;   text-overflow: ellipsis;   overflow: hidden;   margin: auto; } .flogo-flows-detail-diagram-node.flogo-flows-detail-diagram-node-has-warn .flogo-flows-detail-diagram-node-detail-description {   font-family: SourceSansPro-Semibold;   font-size: 11px;   color: #ff9f00; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-menu {   position: absolute;   left: 5px;   top: 0;   z-index: 1;   width: 100px;   height: 100%;   overflow: hidden;   border-radius: 10px;   background-color: rgba(179, 214, 233, 0.9);   transition: all 250ms linear;   cursor: pointer; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-menu-box {   float: left;   margin: 0;   padding: 0;   height: 100%;   width: 98px;   background: #fff;   transition: all 250ms linear; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-menu-box li {   margin-top: 0;   padding-left: 22px;   line-height: 30px;   text-align: left;   list-style: none;   font-size: 11px;   cursor: pointer; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-menu-box li i {   margin-right: 3px; } .flogo-flows-detail-diagram-node .flogo-flows-detail-diagram-node-menu-gear {   float: left;   width: 42px;   height: 100%;   background: url(\"/assets/svg/flogo.flows.detail.diagram.gear.icon.svg\") center 11px no-repeat; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] {   background: none;   box-shadow: none;   border: none;   cursor: pointer; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"]:before {   display: none; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail {   background: none;   box-shadow: none;   border: none;   height: 26px;   padding: 0;   margin: auto;   bottom: 0;   left: 25px;   z-index: 3; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail:before {   display: inline-block;   content: \"==\";   position: absolute;   z-index: 4;   right: 30px;   bottom: 3px;   margin: auto;   font-size: 20px;   font-weight: bold;   color: #FFF; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-menu {   height: 26px;   margin: auto;   bottom: 0;   width: 140px;   left: 22px;   background-color: transparent;   box-shadow: none; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-menu-box {   opacity: 0; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-menu-box > li {   line-height: 24px; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-menu-gear {   background-position: center center;   background-color: rgba(179, 214, 233, 0.9);   opacity: 0;   transition: opacity 250ms linear; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-selected, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-hover, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-run {   position: absolute;   margin: 0;   bottom: -10px;   right: 2px;   transition: all 250ms linear;   width: 95px; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch .img-left, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-selected .img-left, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-hover .img-left, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-run .img-left, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch .img-right, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-selected .img-right, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-hover .img-right, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-run .img-right {   position: absolute;   bottom: 0; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch .img-left, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-selected .img-left, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-hover .img-left, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-run .img-left {   width: 33%;   left: 0; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch .img-right, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-selected .img-right, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-hover .img-right, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-run .img-right {   width: 64%;   height: 70px;   right: 3px; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch {   opacity: 1; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-selected, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-hover, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"] .flogo-flows-detail-diagram-node-detail-branch-run {   opacity: 0; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"].flogo-flows-detail-diagram-node-run .flogo-flows-detail-diagram-node-detail:before {   color: #79B8DC; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"].flogo-flows-detail-diagram-node-run .flogo-flows-detail-diagram-node-detail-branch-run {   opacity: 1; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"].flogo-flows-detail-diagram-node-run .flogo-flows-detail-diagram-node-detail-branch {   opacity: 0; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"]:hover .flogo-flows-detail-diagram-node-detail-branch-hover {   opacity: 1; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"]:hover .flogo-flows-detail-diagram-node-detail:before {   color: #FFF; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"]:hover .flogo-flows-detail-diagram-node-detail-branch, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"]:hover .flogo-flows-detail-diagram-node-detail-branch-run {   opacity: 0; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"].flogo-flows-detail-diagram-node-selected {   transform: none; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"].flogo-flows-detail-diagram-node-selected .flogo-flows-detail-diagram-node-detail:before {   color: #FFF; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"].flogo-flows-detail-diagram-node-selected .flogo-flows-detail-diagram-node-detail-branch-selected {   opacity: 1; } .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"].flogo-flows-detail-diagram-node-selected .flogo-flows-detail-diagram-node-detail-branch, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"].flogo-flows-detail-diagram-node-selected .flogo-flows-detail-diagram-node-detail-branch-run, .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_branch\"].flogo-flows-detail-diagram-node-selected .flogo-flows-detail-diagram-node-detail-branch-hover {   opacity: 0; } .flogo-flows-detail-diagram-node-menu-box li:hover {   background: #ededed; } .flogo-flows-detail-diagram-node-menu-box li i {   margin-right: 10px; } .flogo-flows-detail-diagram-node-badge {   position: absolute;   top: -9px;   right: 10px;   z-index: 4;   color: #fff; } .flogo-flows-detail-diagram-node-badge .flogo-flows-detail-diagram-status-icon {   border-radius: 50%;   width: 18px;   height: 18px;   line-height: 18px;   margin-left: 4px;   display: inline-block; } .flogo-flows-detail-diagram-node-badge .flogo-flows-detail-diagram-status-icon.flogo-flows-detail-diagram-ic-transform {   background-image: url('/assets/svg/flogo.flows.diagram.icon.transform.svg'); } .flogo-flows-detail-diagram-node-badge .flogo-flows-detail-diagram-status-icon.flogo-flows-detail-diagram-ic-error {   background-image: url('/assets/svg/flogo.flows.diagram.icon.error.svg'); } .flogo-flows-detail-diagram-row.hover .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_add\"] {   opacity: 1;   cursor: pointer; } .flogo-flows-detail-diagram-row.hover .flogo-flows-detail-diagram-node[data-flogo-node-type=\"node_holder\"] {   opacity: 1; }"],
            inputs: [
                'tasks',
                'diagram'
            ]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, post_service_1.PostService])
    ], FlogoFlowsDetailDiagramComponent);
    return FlogoFlowsDetailDiagramComponent;
}());
exports.FlogoFlowsDetailDiagramComponent = FlogoFlowsDetailDiagramComponent;
