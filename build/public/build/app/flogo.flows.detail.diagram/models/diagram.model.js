"use strict";
var models_1 = require('../models');
var constants_1 = require('../constants');
var constants_2 = require('../../../common/constants');
var constants_3 = require('../constants');
var constants_4 = require('../constants');
var utils_1 = require('../../../common/utils');
var DEFAULT_MAX_ROW_LEN = 7;
var CLS = {
    diagram: 'flogo-flows-detail-diagram',
    diagramRow: 'flogo-flows-detail-diagram-row',
    diagramRowStatusSelected: 'flogo-flows-detail-diagram-row-selected',
    diagramNode: 'flogo-flows-detail-diagram-node',
    diagramNodeBranchHover: 'flogo-flows-diagram-node-branch-hover',
    diagramNodeStatusSelected: 'flogo-flows-detail-diagram-node-selected',
    diagramNodeStatusRun: 'flogo-flows-detail-diagram-node-run',
    diagramNodeStatusHasError: 'flogo-flows-detail-diagram-node-has-error',
    diagramNodeStatusHasWarn: 'flogo-flows-detail-diagram-node-has-warn',
    diagramNodeDetail: 'flogo-flows-detail-diagram-node-detail',
    diagramNodeDetailBranch: 'flogo-flows-detail-diagram-node-detail-branch',
    diagramNodeDetailBranchSelected: 'flogo-flows-detail-diagram-node-detail-branch-selected',
    diagramNodeDetailBranchHover: 'flogo-flows-detail-diagram-node-detail-branch-hover',
    diagramNodeDetailBranchRun: 'flogo-flows-detail-diagram-node-detail-branch-run',
    diagramNodeDetailIcon: 'flogo-flows-detail-diagram-node-detail-icon',
    diagramNodeDetailTitle: 'flogo-flows-detail-diagram-node-detail-title',
    diagramNodeDetailDesc: 'flogo-flows-detail-diagram-node-detail-description',
    diagramNodeBadge: 'flogo-flows-detail-diagram-node-badge',
    diagramNodeMenu: 'flogo-flows-detail-diagram-node-menu',
    diagramNodeMenuBox: 'flogo-flows-detail-diagram-node-menu-box',
    diagramNodeMenuList: 'flogo-flows-detail-diagram-node-menu-list',
    diagramNodeMenuGear: 'flogo-flows-detail-diagram-node-menu-gear'
};
var FlogoFlowDiagram = (function () {
    function FlogoFlowDiagram(diagram, tasks, elm) {
        this.tasks = tasks;
        this.elm = elm;
        this.MAX_ROW_LEN = DEFAULT_MAX_ROW_LEN;
        this.ng2StyleAttr = '';
        this.updateDiagram(diagram);
    }
    FlogoFlowDiagram.isBranchNode = function (node) {
        return _isBranchNode(node);
    };
    FlogoFlowDiagram.hasBranchRun = function (node, tasks, nodes) {
        return _hasBranchRun(node, tasks, nodes);
    };
    FlogoFlowDiagram.transformDiagram = function (diagram) {
        var matrix = [];
        var root;
        if (diagram && diagram.root && diagram.root.is) {
            root = diagram.nodes[diagram.root.is];
        }
        if (!root) {
            return matrix;
        }
        matrix.push([root.id]);
        _insertChildNodes(matrix, diagram, root);
        constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.groupCollapsed('matrix');
        constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.log(matrix);
        constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.groupEnd();
        return matrix;
    };
    FlogoFlowDiagram.padMatrix = function (matrix, rowLen, diagram) {
        if (rowLen === void 0) { rowLen = DEFAULT_MAX_ROW_LEN; }
        var outputMatrix = [];
        _.each(matrix, function (matrixRow) {
            if (matrixRow.length < rowLen) {
                var paddedRow = void 0;
                if (matrixRow.length
                    === 1
                    && diagram.nodes[matrixRow[0]].type
                        === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW) {
                    paddedRow = matrixRow;
                }
                else {
                    paddedRow = matrixRow.concat('+');
                }
                var rowLenDiff = rowLen - paddedRow.length;
                var paddingArr = _.fill(Array(rowLenDiff), '_');
                outputMatrix.push(paddedRow.concat(paddingArr));
            }
            else {
                outputMatrix.push(matrixRow);
            }
        });
        return outputMatrix;
    };
    FlogoFlowDiagram.getEmptyDiagram = function () {
        var newRootNode = new models_1.FlogoFlowDiagramNode();
        var empytDiagram = {
            root: {
                is: newRootNode.id
            },
            nodes: {}
        };
        newRootNode.type = constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW;
        empytDiagram.nodes[newRootNode.id] = newRootNode;
        return empytDiagram;
    };
    FlogoFlowDiagram.filterOverflowAddNode = function (matrix, nodes, rowLen) {
        if (rowLen === void 0) { rowLen = DEFAULT_MAX_ROW_LEN; }
        var outputMatrix = _.cloneDeep(matrix);
        _.each(outputMatrix, function (matrixRow) {
            if (matrixRow.length > rowLen) {
                var diffRowLen = matrixRow.length - rowLen;
                var node = void 0;
                while (diffRowLen) {
                    var node_1 = nodes[matrixRow[matrixRow.length - 1]];
                    if (node_1 && (node_1.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD ||
                        node_1.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW)) {
                        matrixRow.pop();
                    }
                    diffRowLen--;
                }
            }
        });
        return outputMatrix;
    };
    FlogoFlowDiagram.prototype.update = function (opt) {
        var _this = this;
        var promises = [];
        if (opt.diagram) {
            promises.push(this.updateDiagram(opt.diagram));
        }
        if (opt.tasks) {
            promises.push(this.updateTasks(opt.tasks));
        }
        if (opt.element) {
            promises.push(this.updateElement(opt.element));
        }
        return Promise.all(promises)
            .then(function () { return _this; });
    };
    FlogoFlowDiagram.prototype.updateAndRender = function (opt) {
        var _this = this;
        return this.update(opt)
            .then(function () {
            return _this.render();
        });
    };
    FlogoFlowDiagram.prototype.updateDiagram = function (diagram) {
        if (_.isEmpty(diagram) || _.isEmpty(diagram.root)) {
            this.updateDiagram(FlogoFlowDiagram.getEmptyDiagram());
        }
        else {
            this.root = _.cloneDeep(diagram.root);
            var nodeDict_1 = {};
            _.forIn(diagram.nodes, function (node, nodeID) {
                if (node instanceof models_1.FlogoFlowDiagramNode) {
                    nodeDict_1[nodeID] = node;
                }
                else {
                    nodeDict_1[nodeID] = new models_1.FlogoFlowDiagramNode(node);
                }
            });
            this.nodes = nodeDict_1;
            this.MAX_ROW_LEN = _.isNumber(diagram.MAX_ROW_LEN) ? diagram.MAX_ROW_LEN : this.MAX_ROW_LEN;
        }
        return Promise.resolve(this);
    };
    FlogoFlowDiagram.prototype.updateTasks = function (tasks) {
        this.tasks = tasks;
        return Promise.resolve(this);
    };
    FlogoFlowDiagram.prototype.updateElement = function (elm) {
        d3.select(this.elm)
            .select("." + CLS.diagram)
            .selectAll("." + CLS.diagramRow)
            .remove();
        this.elm = elm;
        return Promise.resolve(this);
    };
    FlogoFlowDiagram.prototype._bindDataToRows = function (rows) {
        return rows.data(FlogoFlowDiagram.filterOverflowAddNode(FlogoFlowDiagram.padMatrix(FlogoFlowDiagram.transformDiagram(this), this.MAX_ROW_LEN, this), this.nodes));
    };
    FlogoFlowDiagram.prototype._handleEnterRows = function (rows) {
        var enterRows = rows
            .enter()
            .append('div')
            .attr(this.ng2StyleAttr, '')
            .classed(CLS.diagramRow, true)
            .style('z-index', function (d, row) { return rows.size() - row; })
            .on('mouseenter', function () {
            d3.select(this)
                .classed('hover', true);
        })
            .on('mouseleave', function () {
            d3.select(this)
                .classed('hover', false);
        });
    };
    FlogoFlowDiagram.prototype._handleUpdateRows = function (rows) {
        rows.classed('updated', true);
        var tasks = this._bindDataToNodes(rows);
        this._handleTaskNodes(tasks, rows);
    };
    FlogoFlowDiagram.prototype._handleExitRows = function (rows) {
        rows.exit()
            .classed({
            'updated': false,
            'exit': true
        })
            .on('mouseenter', null)
            .on('mouseleave', null)
            .remove();
    };
    FlogoFlowDiagram.prototype._bindDataToNodes = function (rows) {
        var _this = this;
        var nodes = rows.selectAll("." + CLS.diagramNode);
        return nodes.data(function (rowNodesIds) {
            return _.map(rowNodesIds, function (nodeID, idx) {
                var nodeInfo = _this.nodes[nodeID];
                if (nodeID === '+') {
                    var found_1 = false;
                    _.forIn(_this.nodesOfAddType, function (node, id) {
                        if (node.parents.indexOf(rowNodesIds[idx - 1]) !== -1) {
                            found_1 = true;
                            nodeInfo = node;
                        }
                    });
                    if (!found_1) {
                        nodeInfo = new models_1.FlogoFlowDiagramNode();
                        _this.nodesOfAddType[nodeInfo.id] = nodeInfo;
                        nodeInfo.linkToParents([rowNodesIds[idx - 1]]);
                    }
                }
                else if (nodeID === '_') {
                    nodeInfo = new models_1.FlogoFlowDiagramNode({
                        id: '',
                        taskID: '',
                        type: constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_HOLDER,
                        children: [],
                        parents: []
                    });
                }
                else if (_.isEmpty(nodeInfo)) {
                    nodeInfo = new models_1.FlogoFlowDiagramNode({
                        id: '',
                        taskID: '',
                        type: constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_PADDING,
                        children: [],
                        parents: []
                    });
                }
                return nodeInfo;
            });
        });
    };
    FlogoFlowDiagram.prototype._handleEnterNodes = function (nodes, rows) {
        var diagram = this;
        var dontCareNodesTypesForNodeMenu = [
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD,
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_HOLDER,
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW,
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_PADDING
        ];
        var newNodes = nodes.enter()
            .append('div')
            .attr('data-task-id', function (nodeInfo) {
            return nodeInfo.taskID || -1;
        })
            .attr(this.ng2StyleAttr, '')
            .classed(CLS.diagramNode, true)
            .on('click', function (d, col, row) {
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.group('on click');
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.group('node data');
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.log(d);
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.groupEnd();
            if (d.taskID) {
                constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.group('task data');
                constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.log(diagram.tasks[d.taskID]);
                constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.groupEnd();
            }
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.group('location in matrix');
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.log("row: " + (row + 1) + ", col: " + (col + 1));
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.groupEnd();
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.group('event');
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.log(d3.event);
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.groupEnd();
            if (d.type
                !== constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_HOLDER
                && d.type
                    !== constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_PADDING) {
                var evtType = '';
                if (d.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD ||
                    d.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW) {
                    evtType = 'flogoAddTask';
                }
                else if ([
                    constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
                    constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT,
                    constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH,
                ].indexOf(d.type) !== -1) {
                    evtType = 'flogoSelectTask';
                }
                if (evtType) {
                    _triggerCustomEvent(evtType, {
                        origEvent: d3.event,
                        node: d,
                        col: col,
                        row: row
                    }, this);
                }
                d3.selectAll("." + CLS.diagramNodeStatusSelected)
                    .classed(CLS.diagramNodeStatusSelected, function (nodeInfo) {
                    _.set(nodeInfo, '__status.isSelected', false);
                    return false;
                });
                d3.selectAll("." + CLS.diagramRowStatusSelected)
                    .classed(CLS.diagramRowStatusSelected, false);
                d3.select(this)
                    .classed(CLS.diagramNodeStatusSelected, function (nodeInfo) {
                    _.set(nodeInfo, '__status.isSelected', true);
                    return true;
                });
                if (d.type !== constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
                    d3.select(this.parentElement)
                        .classed(CLS.diagramRowStatusSelected, true);
                }
            }
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.groupEnd();
        })
            .on('mouseenter', function (d) {
            var element = this;
            if (dontCareNodesTypesForNodeMenu.indexOf(d.type) !== -1) {
                return;
            }
            if (d.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
                var doneFlag_1 = false;
                d3.select(diagram.elm)
                    .selectAll("." + CLS.diagramRow)
                    .each(function (rowNodesIDs, row) {
                    if (!doneFlag_1 && rowNodesIDs.indexOf(d.id) !== -1) {
                        d3.select(this)
                            .classed(CLS.diagramNodeBranchHover, true)
                            .style('z-index', function () { return rows.size() + 1; });
                        doneFlag_1 = true;
                    }
                });
            }
        })
            .on('mouseleave', function (d) {
            if (d.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
                d3.selectAll("." + CLS.diagramNodeBranchHover)
                    .classed(CLS.diagramNodeBranchHover, false);
            }
            if (d.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
                var doneFlag_2 = false;
                d3.select(diagram.elm)
                    .selectAll("." + CLS.diagramRow)
                    .each(function (rowNodesIDs, row) {
                    if (!doneFlag_2 && rowNodesIDs.indexOf(d.id) !== -1) {
                        d3.select(this)
                            .style('z-index', function () { return rows.size() - row; });
                        doneFlag_2 = true;
                    }
                });
            }
        });
    };
    FlogoFlowDiagram.prototype._handleUpdateNodes = function (nodes, rows) {
        var diagram = this;
        nodes.classed({
            'updated': true
        })
            .attr('data-flogo-node-type', function (d) { return constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE[d.type].toLowerCase(); });
        nodes.each(function (d) {
            var thisNode = d3.select(this);
            var task = diagram.tasks && diagram.tasks[d.taskID];
            var classes = {};
            classes[CLS.diagramNodeStatusRun] = false;
            classes[CLS.diagramNodeStatusHasError] = false;
            classes[CLS.diagramNodeStatusHasWarn] = false;
            if (task) {
                var taskStatus = _getTaskStatus(task);
                classes[CLS.diagramNodeStatusRun] = taskStatus['hasRun'];
                classes[CLS.diagramNodeStatusHasError] = taskStatus.hasError;
                classes[CLS.diagramNodeStatusHasWarn] = taskStatus.hasWarning;
                thisNode.classed(classes);
            }
            else {
                thisNode.classed(classes);
            }
            thisNode.attr('data-task-id', function (nodeInfo) {
                var previousID = thisNode.attr('data-task-id');
                if (previousID !== nodeInfo.taskID) {
                    thisNode.classed(CLS.diagramNodeStatusSelected, function (nodeInfo) {
                        return _.get(nodeInfo, '__status.isSelected', false);
                    });
                }
                return nodeInfo.taskID || -1;
            });
        });
        if (!_.some(d3.selectAll("." + CLS.diagramNodeStatusSelected)
            .data(), function (nodesInfo) {
            return nodesInfo && (nodesInfo.type
                === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE
                || nodesInfo.type
                    === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT);
        })) {
            d3.select("." + CLS.diagramRowStatusSelected)
                .classed(CLS.diagramRowStatusSelected, false);
        }
        var nodeMenus = this._bindDataToNodeMenus(nodes.selectAll("." + CLS.diagramNodeMenu));
        this._handleNodeMenus(nodeMenus);
        var nodeDetails = this._bindDataToNodeDetails(rows);
        this._handleNodeDetails(nodeDetails, rows);
        var nodeBadgeArea = this._bindDataToNodeBadges(nodes.selectAll("." + CLS.diagramNodeBadge));
        this._handleNodeBadges(nodeBadgeArea);
    };
    FlogoFlowDiagram.prototype._handleExitNodes = function (nodes, rows) {
        nodes.exit()
            .classed({
            'updated': false,
            'exit': true
        })
            .on('click', null)
            .on('mouseover', null)
            .on('mouseleave', null)
            .on('flogoClickNodeMenu', null)
            .remove();
    };
    FlogoFlowDiagram.prototype._handleTaskNodes = function (tasks, rows) {
        this._handleEnterNodes(tasks, rows);
        this._handleUpdateNodes(tasks, rows);
        this._handleExitNodes(tasks, rows);
    };
    FlogoFlowDiagram.prototype._bindDataToNodeDetails = function (rows) {
        var _this = this;
        var nodeDetails = rows.selectAll("." + CLS.diagramNode)
            .selectAll("." + CLS.diagramNodeDetail);
        return nodeDetails.data(function (nodeInfo) {
            if (nodeInfo) {
                var task = _this.tasks[nodeInfo.taskID];
                if (task && _isNodeHasDetails(nodeInfo)) {
                    var taskDescription = void 0;
                    var taskStatus = _getTaskStatus(task);
                    if (taskStatus.hasWarning) {
                        var _warnings = _.get(task, '__props.warnings', [{ msg: '' }]);
                        taskDescription = _warnings[0].msg;
                    }
                    else {
                        taskDescription = task.description;
                    }
                    return [
                        {
                            name: task.name,
                            desc: taskDescription,
                            type: task.type,
                            taskStatus: taskStatus,
                            nodeInfo: nodeInfo
                        }
                    ];
                }
            }
            return [
                {
                    nodeInfo: nodeInfo
                }
            ];
        });
    };
    FlogoFlowDiagram.prototype._handleEnterNodeDetails = function (nodeDetails, rows) {
        nodeDetails.enter()
            .append('div')
            .attr(this.ng2StyleAttr, '')
            .classed(CLS.diagramNodeDetail, true);
    };
    FlogoFlowDiagram.prototype._handleUpdateNodeDetails = function (nodeDetails, rows) {
        var diagram = this;
        var rowHeight = _getRowHeight(diagram.elm, CLS.diagramRow);
        nodeDetails = rows.selectAll("." + CLS.diagramNodeDetail);
        nodeDetails.html(function (taskInfo, col, row) {
            if (_.isEmpty(taskInfo)) {
                return '';
            }
            if (taskInfo.nodeInfo.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
                var thisBranchRow_1 = row;
                var level_1 = 0;
                var thisBranchParent_1 = {
                    id: taskInfo.nodeInfo.parents[0]
                };
                rows.each(function (rowNodesIDs, row) {
                    if (!level_1) {
                        var parentCol = rowNodesIDs.indexOf(thisBranchParent_1.id);
                        if (parentCol !== -1) {
                            thisBranchParent_1.loc = {
                                col: parentCol,
                                row: row
                            };
                            level_1 = thisBranchRow_1 - row;
                        }
                    }
                });
                var thisBranchLineHeight_1 = rowHeight * level_1 - 31;
                var branchLines_1 = utils_1.genBranchLine({ svgHeight: thisBranchLineHeight_1 });
                return _.map([
                    {
                        class: CLS.diagramNodeDetailBranch,
                        state: 'default'
                    }, {
                        class: CLS.diagramNodeDetailBranchHover,
                        state: 'hover'
                    }, {
                        class: CLS.diagramNodeDetailBranchSelected,
                        state: 'selected'
                    }, {
                        class: CLS.diagramNodeDetailBranchRun,
                        state: 'run'
                    }
                ], function (item) {
                    var branchLine = btoa(branchLines_1[item.state].trim()
                        .replace(/"/g, "'")
                        .replace(/\s+/g, ' '));
                    return "\n              <div " + diagram.ng2StyleAttr + " class=\"" + item.class + "\">\n                <div " + diagram.ng2StyleAttr + " class=\"img-left\" style=\"background:url(data:image/svg+xml;base64," + branchLine + ") left bottom no-repeat; height: " + thisBranchLineHeight_1 + "px\"></div>\n                <div " + diagram.ng2StyleAttr + " class=\"img-right\" style=\"background:url(data:image/svg+xml;base64," + branchLine + ") right bottom no-repeat;\"></div>\n              </div>\n            ";
                })
                    .join('');
            }
            if (taskInfo.name && taskInfo.desc) {
                var iconName = 'activity.icon.svg';
                if (taskInfo.type === constants_2.FLOGO_TASK_TYPE.TASK_ROOT) {
                    iconName = 'trigger.icon.svg';
                }
                return "<img " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeDetailIcon + "\" src=\"/assets/svg/flogo.flows.detail.diagram." + iconName + "\" alt=\"\"/>\n                <div " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeDetailTitle + "\" title=\"" + taskInfo.name + "\">" + taskInfo.name + "</div>\n                <div " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeDetailDesc + "\" title=\"" + taskInfo.desc + "\">" + taskInfo.desc + "</div>";
            }
            else {
                return "";
            }
        });
    };
    FlogoFlowDiagram.prototype._handleExitNodeDetails = function (nodeDetails, rows) {
        nodeDetails.exit()
            .remove();
    };
    FlogoFlowDiagram.prototype._handleNodeDetails = function (nodeDetails, rows) {
        this._handleEnterNodeDetails(nodeDetails, rows);
        this._handleUpdateNodeDetails(nodeDetails, rows);
        this._handleExitNodeDetails(nodeDetails, rows);
    };
    FlogoFlowDiagram.prototype._bindDataToNodeMenus = function (nodeMenus) {
        return nodeMenus.data(function (nodeInfo) {
            if (nodeInfo && _isNodeHasMenu(nodeInfo)) {
                return [nodeInfo];
            }
            return [];
        });
    };
    FlogoFlowDiagram.prototype._handleEnterNodeMenus = function (nodeMenus) {
        var newNodeMenus = nodeMenus.enter();
        newNodeMenus.append('div')
            .attr(this.ng2StyleAttr, '')
            .classed(CLS.diagramNodeMenu, true)
            .on('click', function (nodeInfo, col, row) {
            var event = d3.event;
            event.stopPropagation();
            if (event.target.getAttribute('data-menu-item-type')) {
                var evtType = 'flogoClickNodeMenuItem';
                _triggerCustomEvent(evtType, {
                    origEvent: d3.event,
                    node: nodeInfo
                }, this);
            }
        });
    };
    FlogoFlowDiagram.prototype._handleUpdateNodeMenus = function (nodeMenus) {
        var diagram = this;
        nodeMenus.html(function (nodeInfo, ignore, idxInTotalNodes) {
            var tplItemAddBranch = "<li " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeMenuList + "\" data-menu-item-type=\"" + constants_1.FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.ADD_BRANCH + "\"><i " + diagram.ng2StyleAttr + " class=\"fa fa-plus\"></i>Add branch</li>";
            var tplItemTransform = "<li " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeMenuList + "\" data-menu-item-type=\"" + constants_1.FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.SELECT_TRANSFORM + "\"><i " + diagram.ng2StyleAttr + " class=\"fa fa-bolt\"></i>Transform</li>";
            var tplItemDelete = "<li " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeMenuList + "\" data-menu-item-type=\"" + constants_1.FLOGO_FLOW_DIAGRAM_NODE_MENU_ITEM_TYPE.DELETE + "\"><i " + diagram.ng2StyleAttr + " class=\"fa fa-trash-o\"></i>Delete</li>";
            var tplGear = "<span " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeMenuGear + "\"></span>";
            if (nodeInfo.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT) {
                return "";
            }
            if (nodeInfo.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
                return "<ul " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeMenuBox + "\">\n                    " + tplItemDelete + "\n                  </ul>" + tplGear;
            }
            if ((idxInTotalNodes + 1) % 7) {
                return "<ul " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeMenuBox + "\">\n                    " + tplItemAddBranch + "\n                    " + tplItemTransform + "\n                    " + tplItemDelete + "\n                </ul>" + tplGear;
            }
            else {
                return "<ul " + diagram.ng2StyleAttr + " class=\"" + CLS.diagramNodeMenuBox + "\">\n                    " + tplItemTransform + "\n                    " + tplItemDelete + "\n                </ul>" + tplGear;
            }
        });
    };
    FlogoFlowDiagram.prototype._handleExitNodeMenus = function (nodeMenus) {
        var exitNodeMenus = nodeMenus.exit();
        exitNodeMenus.on('click', null)
            .remove();
    };
    FlogoFlowDiagram.prototype._handleNodeMenus = function (nodeMenus) {
        this._handleEnterNodeMenus(nodeMenus);
        this._handleUpdateNodeMenus(nodeMenus);
        this._handleExitNodeMenus(nodeMenus);
    };
    FlogoFlowDiagram.prototype._bindDataToNodeBadges = function (nodeBadges) {
        var _this = this;
        return nodeBadges.data(function (nodeInfo) {
            if (nodeInfo) {
                var task = _this.tasks[nodeInfo.taskID];
                var taskStatus = _getTaskStatus(task);
                var errors = _.get(task, '__props.errors', []);
                if (task) {
                    return [
                        {
                            hasError: taskStatus.hasError,
                            hasMapping: _isTaskHasMapping(task),
                            errors: errors
                        }
                    ];
                }
            }
            return [];
        });
    };
    FlogoFlowDiagram.prototype._handleEnterNodeBadges = function (nodeBadges) {
        nodeBadges.enter()
            .append('div')
            .attr(this.ng2StyleAttr, '')
            .classed(CLS.diagramNodeBadge, true);
    };
    FlogoFlowDiagram.prototype._handleUpdateNodeBadges = function (nodeBadges) {
        var diagram = this;
        nodeBadges.html(function (taskStatus) {
            var tpl = '';
            if (taskStatus) {
                if (taskStatus.hasError) {
                    var message = _.reduce(taskStatus.errors, function (result, error) {
                        return result + "[Error][" + moment(error.time || new Date().toJSON())
                            .fromNow() + "]: " + error.msg + "\n";
                    }, '');
                    tpl += "<i " + diagram.ng2StyleAttr + " class=\"flogo-flows-detail-diagram-status-icon flogo-flows-detail-diagram-ic-error\" title=\"" + message.trim() + "\"></i>";
                }
                if (taskStatus.hasMapping) {
                    tpl += "<i " + diagram.ng2StyleAttr + " class=\"flogo-flows-detail-diagram-status-icon flogo-flows-detail-diagram-ic-transform\"></i>";
                }
            }
            return tpl;
        });
    };
    FlogoFlowDiagram.prototype._handleExitNodeBadges = function (nodeBadges) {
        nodeBadges.exit()
            .remove();
    };
    FlogoFlowDiagram.prototype._handleNodeBadges = function (nodeBadges) {
        this._handleEnterNodeBadges(nodeBadges);
        this._handleUpdateNodeBadges(nodeBadges);
        this._handleExitNodeBadges(nodeBadges);
    };
    FlogoFlowDiagram.prototype.render = function () {
        constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.group('rendering...');
        this.rootElm = d3.select(this.elm)
            .select("." + CLS.diagram);
        !this.ng2StyleAttr && this._updateNG2StyleAttr();
        this.nodesOfAddType = this.nodesOfAddType || {};
        var rows = this._bindDataToRows(this.rootElm.selectAll("." + CLS.diagramRow));
        this._handleEnterRows(rows);
        this._handleUpdateRows(rows);
        this._handleExitRows(rows);
        constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.groupEnd();
        return Promise.resolve(this);
    };
    FlogoFlowDiagram.prototype.triggerByTaskID = function (eventName, taskID) {
        if (!eventName || !taskID) {
            return Promise.resolve(this);
        }
        var nodeID;
        for (var nid in this.nodes) {
            if (this.nodes[nid].taskID === taskID) {
                nodeID = nid;
                break;
            }
        }
        var node = this.nodes[nodeID];
        if (!node) {
            return Promise.resolve(this);
        }
        var diagram = this;
        var allNodes = d3.selectAll("." + CLS.diagramNode);
        var nodeInDiagram;
        var prevNodeInDiagram;
        var nextNodeInDiagram;
        var doneFlag = false;
        allNodes.each(function (nodeInfo, idx) {
            if (doneFlag) {
                if (nodeInDiagram && !nextNodeInDiagram) {
                    nextNodeInDiagram = d3.select(this);
                }
                return;
            }
            if (nodeInfo.id === nodeID) {
                doneFlag = true;
                nodeInDiagram = d3.select(this);
            }
            else {
                prevNodeInDiagram = d3.select(this);
            }
            return;
        });
        try {
            switch (eventName) {
                case 'addTask':
                    $(nextNodeInDiagram[0][0])
                        .trigger('click');
                    break;
                case 'selectTask':
                case 'selectTrigger':
                    $(nodeInDiagram[0][0])
                        .trigger('click');
                    break;
                default:
                    $(nodeInDiagram[0][0])
                        .trigger(eventName);
                    break;
            }
        }
        catch (e) {
            console.error(e);
        }
        return Promise.resolve(this);
    };
    FlogoFlowDiagram.prototype.linkNodeWithTask = function (nodeID, task) {
        var node = this.nodes[nodeID] || this.nodesOfAddType[nodeID];
        if (node) {
            node.taskID = task.id;
            if (node.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD) {
                this.nodes[node.id] = node;
                delete this.nodesOfAddType[node.id];
                node.type = constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE;
                var parentNode = this.nodes[node.parents[0]];
                parentNode.linkToChildren([node.id]);
            }
            else if (node.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW) {
                node.type = constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT;
            }
        }
        else {
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.warn('Cannot find the node');
        }
        return Promise.resolve(this);
    };
    FlogoFlowDiagram.prototype.findNodesByType = function (type, sourceNodes) {
        var nodes = [];
        if (sourceNodes) {
            _.each(sourceNodes, function (node) {
                if (node.type === type) {
                    nodes.push(node);
                }
            });
        }
        else {
            _.mapKeys(this.nodes, function (node) {
                if (node.type === type) {
                    nodes.push(node);
                }
            });
        }
        return nodes;
    };
    FlogoFlowDiagram.prototype.findNodesByIDs = function (ids) {
        var _this = this;
        var nodes = [];
        _.each(ids, function (id) {
            var node = _this.nodes[id];
            node && nodes.push(node);
        });
        return nodes;
    };
    FlogoFlowDiagram.prototype.findChildrenNodesByType = function (type, node) {
        return this.findNodesByType(type, this.findNodesByIDs(node.children));
    };
    FlogoFlowDiagram.prototype.findParentsNodesByType = function (type, node) {
        return this.findNodesByType(type, this.findNodesByIDs(node.parents));
    };
    FlogoFlowDiagram.prototype.deleteNode = function (node) {
        var deleteNode = this.nodes[node.id];
        if (deleteNode) {
            _deleteNode(deleteNode, this.nodes);
        }
        else {
            return Promise.reject("Node " + node.id + " doesn't exists.");
        }
        return Promise.resolve(this);
    };
    FlogoFlowDiagram.prototype.addBranch = function (parentNode, branchInfo) {
        var node = new models_1.FlogoFlowDiagramNode({
            id: models_1.FlogoFlowDiagramNode.genNodeID(),
            type: constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH,
            taskID: branchInfo.id,
            parents: [parentNode.id],
            children: []
        });
        this.nodes[node.id] = node;
        this.nodes[parentNode.id].linkToChildren([node.id]);
        return Promise.resolve(this);
    };
    FlogoFlowDiagram.prototype._updateNG2StyleAttr = function () {
        var _this = this;
        var el = this.elm.getElementsByClassName(CLS.diagram);
        var ng2StyleAttrReg = /^_ngcontent\-.*$/g;
        if (el && el.length) {
            Array.prototype.some.call(el[0].attributes, function (attr) {
                if (ng2StyleAttrReg.test(attr.name)) {
                    _this.ng2StyleAttr = attr.name;
                    return true;
                }
                return false;
            });
            return true;
        }
        return false;
    };
    return FlogoFlowDiagram;
}());
exports.FlogoFlowDiagram = FlogoFlowDiagram;
function _insertChildNodes(matrix, diagram, node) {
    var curRowIdx = matrix.length - 1;
    if (node.children.length) {
        node.children.sort(function (nodeAID, nodeBID) {
            if (diagram.nodes[nodeAID].type === diagram.nodes[nodeBID].type) {
                return 0;
            }
            else if (diagram.nodes[nodeAID].type
                === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH
                || diagram.nodes[nodeAID].type
                    === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_LINK) {
                return 1;
            }
            else {
                return -1;
            }
        });
        _.each(node.children, function (nodeID) {
            if (diagram.nodes[nodeID].type !== constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
                matrix[curRowIdx].push(nodeID);
            }
            else {
                var newRow = Array(matrix[curRowIdx].indexOf(node.id));
                newRow.push(nodeID);
                matrix.push(newRow);
            }
            if (diagram.nodes[nodeID].type !== constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_LINK) {
                _insertChildNodes(matrix, diagram, diagram.nodes[nodeID]);
            }
        });
    }
    return matrix;
}
function _triggerCustomEvent(eventType, eventDetail, elm) {
    if (CustomEvent && elm.dispatchEvent) {
        if (eventType) {
            var evtDetail = {
                'view': window,
                'bubbles': true,
                'cancelable': true,
                'cancelBubble': true,
                'detail': eventDetail
            };
            elm.dispatchEvent(new CustomEvent(eventType, evtDetail));
            return true;
        }
        else {
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.warn('No eventType is given.');
            return false;
        }
    }
    else {
        constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.warn('Unsupport CustomEvent or dispatchEvent');
        return false;
    }
}
function _getTaskStatus(task) {
    var _errors = _.get(task, '__props.errors', []);
    var _warnings = _.get(task, '__props.warnings', []);
    var taskStatus = {
        hasError: !_.isEmpty(_errors),
        hasWarning: !_.isEmpty(_warnings)
    };
    _.forIn(_.get(task, '__status', {}), function (val, statusName) {
        taskStatus[statusName] = val;
    });
    return taskStatus;
}
function _isNodeHasDetails(nodeInfo) {
    if (nodeInfo.type) {
        return [
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD,
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW,
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_HOLDER
        ].indexOf(nodeInfo.type) === -1;
    }
    else {
        return false;
    }
}
function _isNodeHasMenu(nodeInfo) {
    if (nodeInfo.type) {
        return [
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD,
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW,
            constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_HOLDER
        ].indexOf(nodeInfo.type) === -1;
    }
    else {
        return false;
    }
}
function _isTaskHasMapping(taskInfo) {
    return taskInfo && ((_.isArray(taskInfo.inputMappings) && taskInfo.inputMappings.length > 0));
}
function _getRowHeight(elm, rowClassName) {
    var rowElm = elm.querySelector("." + rowClassName);
    var clientRect = rowElm.getBoundingClientRect();
    return clientRect.height;
}
function _isInSingleRow(node) {
    return (node.parents.length === 1 && node.children.length < 2);
}
function _isBranchNode(node) {
    return node.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH;
}
function _hasTaskRun(node, tasks) {
    if (!node || !tasks) {
        return false;
    }
    var task = tasks[node.taskID];
    if (!task) {
        return false;
    }
    return _.get(task, '__status.hasRun', false);
}
function _hasBranchRun(node, tasks, nodes) {
    if (!node || !tasks || !nodes || !_isBranchNode(node)) {
        return false;
    }
    var parents = _.get(node, 'parents', []);
    var children = _.get(node, 'children', []);
    if (!parents.length || !children.length) {
        return false;
    }
    return _.some(parents, function (parent) { return _hasTaskRun(nodes[parent], tasks); }) && _.some(children, function (child) { return _hasTaskRun(nodes[child], tasks); });
}
function _removeNodeInSingleRow(node, nodes) {
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.group("_removeNodeInSingleRow: " + node.id);
    var itsParent = nodes[node.parents[0]];
    var itsChild = nodes[node.children[0]];
    if (itsChild) {
        if (itsChild.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
            _removeBranchNode(itsChild, nodes);
            itsParent.children.splice(itsParent.children.indexOf(node.id), 1);
        }
        else {
            itsChild.parents.splice(itsChild.parents.indexOf(node.id), 1, itsParent.id);
            itsParent.children.splice(itsParent.children.indexOf(node.id), 1, itsChild.id);
        }
    }
    else {
        itsParent.children.splice(itsParent.children.indexOf(node.id), 1);
    }
    delete nodes[node.id];
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupEnd();
}
function _removeNodeHasChildren(node, nodes) {
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.group("_removeNodeHasChildren: " + node.id);
    if (node.children.length > 1) {
        node.children = _.filter(_.clone(node.children), function (childNodeID) {
            var childNode = nodes[childNodeID];
            if (childNode && childNode.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
                _deleteNode(childNode, nodes);
                return false;
            }
            return true;
        });
    }
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(_.cloneDeep(node));
    _deleteNode(node, nodes);
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupEnd();
}
function _removeBranchNode(node, nodes) {
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.group("_removeBranchNode: " + node.id);
    if (node.children.length > 0) {
        _recursivelyDeleteNodes(nodes[node.children[0]], nodes);
    }
    _removeNodeInSingleRow(node, nodes);
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupEnd();
}
function _deleteNode(node, nodes) {
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.group("_deleteNode: " + node.id);
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(_.cloneDeep(node));
    if (node && nodes) {
        if (node.children.length > 1) {
            _removeNodeHasChildren(node, nodes);
        }
        else if (node.type === constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
            _removeBranchNode(node, nodes);
        }
        else if (_isInSingleRow(node)) {
            _removeNodeInSingleRow(node, nodes);
        }
        else {
            constants_3.FLOGO_FLOW_DIAGRAM_DEBUG && console.warn('Unsupported case..');
        }
    }
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupEnd();
}
function _recursivelyDeleteNodes(node, nodes) {
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.group("_recursivelyDeleteNodes: " + node.id);
    if (node.children.length > 0) {
        _.each(_.clone(node.children), function (childNodeID) {
            var childNode = nodes[childNodeID];
            if (childNode) {
                _recursivelyDeleteNodes(childNode, nodes);
            }
        });
    }
    _deleteNode(node, nodes);
    constants_4.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupEnd();
}
