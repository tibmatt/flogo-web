"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flogoFlowToJSON = flogoFlowToJSON;

var _utils = require('../common/utils');

var _constants = require('../common/constants');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function flogoFlowToJSON(inFlow) {
  var DEBUG = false;
  var INFO = true;
  var linkIDCounter = 0;
  var _genLinkID = function _genLinkID() {
    return ++linkIDCounter;
  };
  var flowJSON = {};
  var flowID = _lodash2.default.get(inFlow, '_id');
  if (_lodash2.default.isEmpty(flowID)) {
    DEBUG && console.error('No id in the given flow');
    DEBUG && console.log(inFlow);
    return flowJSON;
  }
  var flowPath = _lodash2.default.get(inFlow, 'paths');
  var flowPathRoot = _lodash2.default.get(flowPath, 'root');
  var flowPathNodes = _lodash2.default.get(flowPath, 'nodes');
  if (_lodash2.default.isEmpty(flowPath) || _lodash2.default.isEmpty(flowPathRoot) || _lodash2.default.isEmpty(flowPathNodes)) {
    DEBUG && console.warn('Invalid path information in the given flow');
    DEBUG && console.log(inFlow);
    return flowJSON;
  }
  var flowItems = _lodash2.default.get(inFlow, 'items');
  if (_lodash2.default.isEmpty(flowItems)) {
    DEBUG && console.warn('Invalid items information in the given flow');
    DEBUG && console.log(inFlow);
    return flowJSON;
  }
  flowJSON.id = (0, _utils.flogoIDEncode)(flowID);
  flowJSON.name = _lodash2.default.get(inFlow, 'name', '');
  flowJSON.description = _lodash2.default.get(inFlow, 'description', '');
  flowJSON.flow = function _parseFlowInfo() {
    var flow = {};
    flow.name = flowJSON.name;
    flow.model = _lodash2.default.get(inFlow, 'model', 'tibco-simple');
    flow.type = _lodash2.default.get(inFlow, 'type', _constants.FLOGO_PROCESS_TYPE.DEFAULT);
    flow.attributes = _parseFlowAttributes(_lodash2.default.get(inFlow, 'attributes', []));
    flow.rootTask = function _parseRootTask() {
      var rootTask = {
        id: 1,
        type: _constants.FLOGO_TASK_TYPE.TASK,
        activityType: '',
        name: 'root',
        tasks: [],
        links: []
      };
      var rootNode = flowPathNodes[flowPathRoot.is];
      _traversalDiagram(rootNode, flowPathNodes, flowItems, rootTask.tasks, rootTask.links);
      return rootTask;
    }();
    return flow;
  }();
  INFO && console.log('Generated flow.json: ', flowJSON);
  function _traversalDiagram(rootNode, nodes, tasks, tasksDest, linksDest) {
    var visited = [];
    _traversalDiagramChildren(rootNode, visited, nodes, tasks, tasksDest, linksDest);
  }
  function _traversalDiagramChildren(node, visitedNodes, nodes, tasks, tasksDest, linksDest) {
    if (!_lodash2.default.includes(visitedNodes, node.id)) {
      visitedNodes.push(node.id);
      var nodesToGo = _lodash2.default.difference(node.children, visitedNodes);
      _lodash2.default.each(nodesToGo, function (nid) {
        var childNode = nodes[nid];
        if (childNode.type === _constants.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ADD || childNode.type === _constants.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT_NEW) {
          return;
        }
        if (childNode.type === _constants.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH) {
          var branch = tasks[childNode.taskID];
          if (branch && childNode.children.length === 1) {
            DEBUG && console.log('Found a branch with activity!');
            _traversalDiagramChildren(childNode, visitedNodes, nodes, tasks, tasksDest, linksDest);
          } else {
            DEBUG && console.warn('- Found a branch!\n- Don\'t care..');
          }
          return;
        }
        var task = tasks[childNode.taskID];
        if (_isValidInternalTaskInfo(task)) {
          var taskInfo = {};
          taskInfo.id = (0, _utils.convertTaskID)(task.id);
          taskInfo.name = _lodash2.default.get(task, 'name', '');
          taskInfo.type = task.type;
          taskInfo.activityType = task.activityType;
          taskInfo.attributes = _parseFlowAttributes(_lodash2.default.get(task, 'attributes.inputs'));
          var inputMappings = _parseFlowMappings(_lodash2.default.get(task, 'inputMappings'));
          if (!_lodash2.default.isEmpty(inputMappings)) {
            taskInfo.inputMappings = inputMappings;
          }
          var outputMappings = _parseFlowMappings(_lodash2.default.get(task, 'outputMappings'));
          if (!_lodash2.default.isEmpty(outputMappings)) {
            taskInfo.ouputMappings = outputMappings;
          }
          tasksDest.push(taskInfo);
        } else {
          INFO && console.warn('Invalid task found.');
          INFO && console.warn(task);
        }
        if (node.type === _constants.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE) {
          linksDest.push({
            id: _genLinkID(),
            from: (0, _utils.convertTaskID)(node.taskID),
            to: (0, _utils.convertTaskID)(childNode.taskID),
            type: _constants.FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.DEFAULT
          });
        } else if (node.type === _constants.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH && node.parents.length === 1) {
          var parentNode = nodes[node.parents[0]];
          var branch = tasks[node.taskID];
          if (parentNode.type !== _constants.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT) {
            linksDest.push({
              id: _genLinkID(),
              from: (0, _utils.convertTaskID)(parentNode.taskID),
              to: (0, _utils.convertTaskID)(childNode.taskID),
              type: _constants.FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH,
              value: branch.condition
            });
          }
        }
        _traversalDiagramChildren(childNode, visitedNodes, nodes, tasks, tasksDest, linksDest);
      });
    }
  }
  function _isValidInternalTaskInfo(task) {
    if (_lodash2.default.isEmpty(task)) {
      DEBUG && console.warn('Empty task');
      return false;
    }
    if (_lodash2.default.isEmpty(task.id)) {
      DEBUG && console.warn('Empty task id');
      DEBUG && console.log(task);
      return false;
    }
    if (!_lodash2.default.isNumber(task.type)) {
      DEBUG && console.warn('Invalid task type');
      DEBUG && console.log(task);
      return false;
    }
    if (_lodash2.default.isEmpty(task.activityType)) {
      DEBUG && console.warn('Empty task activityType');
      DEBUG && console.log(task);
      return false;
    }
    return true;
  }
  function _parseFlowAttributes(inAttrs) {
    var attributes = [];
    _lodash2.default.each(inAttrs, function (inAttr) {
      var attr = {};
      attr.name = _lodash2.default.get(inAttr, 'name');
      attr.value = _lodash2.default.get(inAttr, 'value');
      if (_lodash2.default.isEmpty(attr.name)) {
        DEBUG && console.warn('Empty attribute name found');
        DEBUG && console.log(inAttr);
        return;
      }
      var enumType = _lodash2.default.get(inAttr, 'type');
      var type = _lodash2.default.findKey(_constants.FLOGO_TASK_ATTRIBUTE_TYPE, function (val) {
        return val == enumType;
      });
      attr.type = type ? type.toLowerCase() : 'string';
      attributes.push(attr);
    });
    return attributes;
  }
  function _parseFlowMappings(inMappings) {
    var mappings = [];
    _lodash2.default.each(inMappings, function (inMapping) {
      var mapping = {};
      mapping.type = _lodash2.default.get(inMapping, 'type');
      mapping.value = _lodash2.default.get(inMapping, 'value');
      mapping.mapTo = _lodash2.default.get(inMapping, 'mapTo');
      if (_lodash2.default.isUndefined(mapping.type)) {
        DEBUG && console.warn('Empty mapping type found');
        DEBUG && console.log(inMapping);
        return;
      }
      if (_lodash2.default.isEmpty(mapping.value)) {
        DEBUG && console.warn('Empty mapping value found');
        DEBUG && console.log(inMapping);
        return;
      }
      if (_lodash2.default.isEmpty(mapping.mapTo)) {
        DEBUG && console.warn('Empty mapping mapTo found');
        DEBUG && console.log(inMapping);
        return;
      }
      if (!_lodash2.default.isNumber(mapping.type)) {
        INFO && console.warn("Force invalid mapping type to 1 since it's not a number.");
        INFO && console.log(mapping);
        mapping.type = 1;
      }
      mappings.push(mapping);
    });
    return mappings;
  }
  return flowJSON;
}