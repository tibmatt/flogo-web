'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addTriggerToFlow = addTriggerToFlow;
exports.addActivityToFlow = addActivityToFlow;
exports.findNodeNotChildren = findNodeNotChildren;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../../common/utils');

var _constants = require('../../common/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addTriggerToFlow(flow, trigger) {
  var newFlow = _lodash2.default.cloneDeep(flow);
  var nodeID = (0, _utils.genNodeID)();
  var triggerID = (0, _utils.flogoGenTriggerID)();
  trigger.id = triggerID;

  //override the root
  newFlow.paths = { root: { is: nodeID } };
  newFlow.paths.nodes = _lodash2.default.get(newFlow, 'paths.nodes', {});
  newFlow.paths.nodes[nodeID] = {
    id: nodeID,
    taskID: triggerID,
    type: _constants.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT,
    children: [],
    parents: []
  };

  var items = _lodash2.default.get(newFlow, "items", {});
  items[triggerID] = trigger;
  newFlow["items"] = items;

  return newFlow;
}

function addActivityToFlow(flow, activity) {
  var newFlow = _lodash2.default.cloneDeep(flow);
  var nodeID = (0, _utils.genNodeID)();
  var activityID = (0, _utils.flogoGenTaskID)(flow.items || {});
  activity.id = activityID;

  var node = findNodeNotChildren(newFlow);
  console.log('THE NO CHILDREN IS: --------');
  console.log(node);
  node.children.push(nodeID);

  newFlow.paths.nodes = _lodash2.default.get(newFlow, 'paths.nodes', {});
  newFlow.paths.nodes[nodeID] = {
    id: nodeID,
    taskID: activityID,
    type: _constants.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
    children: [],
    parents: [node.id]
  };

  var items = _lodash2.default.get(newFlow, "items", {});
  items[activityID] = activity;
  newFlow["items"] = items;

  return newFlow;
}

function findNodeNotChildren(flow) {
  var nodes = _lodash2.default.get(flow, 'paths.nodes', {});

  for (var key in nodes) {
    if (nodes.hasOwnProperty(key)) {
      if (nodes[key] && nodes[key].children && !nodes[key].children.length) {
        return nodes[key];
      }
    }
  }

  return null;
}