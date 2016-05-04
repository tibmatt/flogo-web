import _ from 'lodash';
import {isJson, flogoIDEncode, flogoIDDecode, flogoGenTaskID, genNodeID} from '../../common/utils';
import {FLOGO_FLOW_DIAGRAM_NODE_TYPE} from '../../common/constants';


export function addTriggerToFlow(flow, trigger) {
  var newFlow = _.cloneDeep(flow);
  var nodeID = genNodeID()
  var triggerID = flogoGenTaskID();
  trigger.id = triggerID;

  //override the root
  newFlow.paths =  { root:{is:nodeID} };
  newFlow.paths.nodes = _.get(newFlow, 'paths.nodes', {});
  newFlow.paths.nodes[nodeID] = {
                                  id: nodeID,
                                  taskID: triggerID,
                                  type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT,
                                  children: [],
                                  parents: []
                                };

  let items = _.get(newFlow, "items",{});
  items[triggerID] = trigger;
  newFlow["items"] = items;

  return newFlow;
}

export function addActivityToFlow(flow, activity) {
  var newFlow = _.cloneDeep(flow);
  var nodeID = genNodeID();
  var activityID = flogoGenTaskID();
  activity.id = activityID;

  var node = findNodeNotChildren(newFlow);
  console.log('THE NO CHILDREN IS: --------');
  console.log(node);
  node.children.push(nodeID);

  newFlow.paths.nodes = _.get(newFlow, 'paths.nodes', {});
  newFlow.paths.nodes[nodeID] = {
    id: nodeID,
    taskID: activityID,
    type: FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
    children: [],
    parents: [node.id]
  };

  let items = _.get(newFlow, "items",{});
  items[activityID] = activity;
  newFlow["items"] = items;

  return newFlow;
}

export function findNodeNotChildren(flow) {
  let nodes = _.get(flow, 'paths.nodes', {});

  for(var key in nodes) {
    if(nodes.hasOwnProperty(key)) {
      if(nodes[key]&&nodes[key].children && !nodes[key].children.length) {
        return nodes[key];
      }

    }
  }

  return null;
}
