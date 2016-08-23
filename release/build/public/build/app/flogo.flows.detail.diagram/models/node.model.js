"use strict";
var constants_1 = require('../constants');
var utils_1 = require('../../../common/utils');
var constants_2 = require('../constants');
var FlogoFlowDiagramNode = (function () {
    function FlogoFlowDiagramNode(node) {
        if (!node) {
            node = {
                id: FlogoFlowDiagramNode.genNodeID(),
                taskID: '',
                type: constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD,
                children: [],
                parents: []
            };
        }
        this.update(node);
    }
    ;
    FlogoFlowDiagramNode.genNodeID = function () {
        var id = '';
        if (performance && _.isFunction(performance.now)) {
            id = "FlogoFlowDiagramNode::" + Date.now() + "::" + performance.now();
        }
        else {
            id = "FlogoFlowDiagramNode::" + Date.now() + "}";
        }
        return utils_1.flogoIDEncode(id);
    };
    ;
    FlogoFlowDiagramNode.prototype.update = function (node) {
        this.id = node.id;
        this.taskID = node.taskID;
        this.type = node.type;
        this.children = _.cloneDeep(node.children);
        this.parents = _.cloneDeep(node.parents);
        this.subProc = _.cloneDeep(node.subProc);
        return Promise.resolve(this);
    };
    ;
    FlogoFlowDiagramNode.prototype.hasNoChild = function () {
        return !this.children.length;
    };
    ;
    FlogoFlowDiagramNode.prototype.hasNoParent = function () {
        return !this.parents.length;
    };
    ;
    FlogoFlowDiagramNode.prototype.linkTo = function (nodes) {
        var promises = [];
        if (nodes.children) {
            promises.push(this.linkToChildren(nodes.children));
        }
        if (nodes.parents) {
            promises.push(this.linkToParents(nodes.parents));
        }
        return Promise.all(promises);
    };
    ;
    FlogoFlowDiagramNode.prototype.linkToChildren = function (nodeIDs) {
        this.children = _.union(this.children, nodeIDs);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupCollapsed(this.id + ' linkToChildren');
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(this);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(this.children);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupEnd();
        return Promise.resolve(true);
    };
    ;
    FlogoFlowDiagramNode.prototype.linkToParents = function (nodeIDs) {
        this.parents = _.union(this.parents, nodeIDs);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupCollapsed(this.id + ' linkToParents');
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(this);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(this.parents);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupEnd();
        return Promise.resolve(true);
    };
    ;
    FlogoFlowDiagramNode.prototype.unlinkFrom = function (nodes) {
        var promises = [];
        if (nodes.children) {
            promises.push(this.unlinkFromChildren(nodes.children));
        }
        if (nodes.parents) {
            promises.push(this.unlinkFromParents(nodes.parents));
        }
        return Promise.all(promises);
    };
    ;
    FlogoFlowDiagramNode.prototype.unlinkFromChildren = function (nodeIDs) {
        var removed = _.remove(this.children, function (nodeID) {
            return nodeIDs.indexOf(nodeID) !== -1;
        });
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupCollapsed(this.id + ' unlinkFromChildren');
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(this);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(removed);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupEnd();
        return Promise.resolve(true);
    };
    ;
    FlogoFlowDiagramNode.prototype.unlinkFromParents = function (nodeIDs) {
        var removed = _.remove(this.parents, function (nodeID) {
            return nodeIDs.indexOf(nodeID) !== -1;
        });
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupCollapsed(this.id + ' unlinkFromParents');
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(this);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.log(removed);
        constants_2.FLOGO_FLOW_DIAGRAM_VERBOSE && console.groupEnd();
        return Promise.resolve(true);
    };
    ;
    return FlogoFlowDiagramNode;
}());
exports.FlogoFlowDiagramNode = FlogoFlowDiagramNode;
