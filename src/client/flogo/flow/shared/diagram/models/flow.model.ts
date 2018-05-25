import { difference, cloneDeep, find, get, each, includes, isEmpty, isNumber, isString, isUndefined, trim  } from 'lodash';
import {convertTaskID, getDefaultValue, isSubflowTask} from '@flogo/shared/utils';

import { FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE } from '../constants';
import { FlowMetadata, MetadataAttribute } from '@flogo/core/interfaces/flow';
import {
  AttributeMapping as DiagramTaskAttributeMapping,
  TaskAttribute as DiagramTaskAttribute,
  flowToJSON_Attribute,
  UiFlow,
  flowToJSON_Link,
  flowToJSON_Mapping,
  flowToJSON_RootTask,
  flowToJSON_Task,
  LegacyFlow,
  LegacyFlowWrapper,
  ValueType,
  FLOGO_PROCESS_TYPE,
  FLOGO_TASK_TYPE,
  Dictionary,
  Item,
  ActivitySchema,
  ItemActivityTask,
  ItemBranch,
  ItemTask, FlowGraph, GraphNode, NodeType,
} from '@flogo/core';
import { mergeItemWithSchema } from '@flogo/core/models';
/**
 * Convert the flow to flow.json
 *
 * @param inFlow
 * @returns {LegacyFlowWrapper}
 */
export function flogoFlowToJSON(inFlow: UiFlow): LegacyFlowWrapper {

  const DEBUG = false;
  const INFO = true;

  // TODO
  //  task link should only be unique within a flow, hence
  //  for the moment, using the linkCounter to keep increasing the
  //  link number within a session is fine.
  let linkIDCounter = 0;
  const _genLinkID = () => ++linkIDCounter;

  const flowJSON = <LegacyFlowWrapper>{};

  /* validate the required fields */

  const flowID = inFlow.id;

  if (isEmpty(flowID)) {
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.error('No id in the given flow');
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.log(inFlow);
    return flowJSON;
  }

  const flowPath = inFlow.mainGraph;
  const errorPath: FlowGraph = inFlow.errorGraph;
  const flowPathRoot = flowPath.rootId;
  const flowPathNodes = flowPath.nodes;
  const errorPathRoot = errorPath.rootId;
  const errorPathNodes = errorPath.nodes;
  const isFlowPath = isEmpty(flowPath) || isEmpty(flowPathRoot) || isEmpty(flowPathNodes);
  const isErrorPath = isEmpty(errorPath) || isEmpty(errorPathRoot) || isEmpty(errorPathNodes);

  flowJSON.id = flowID;
  flowJSON.name = inFlow.name || '';
  flowJSON.description = inFlow.description || '';
  flowJSON.metadata = _parseMetadata(inFlow.metadata || {
    input: [],
    output: [],
  });

  function _parseMetadata(metadata: FlowMetadata): FlowMetadata {
    const flowMetadata: FlowMetadata = {
      input: [],
      output: []
    };
    flowMetadata.input = metadata.input.map(input => {
      const inputMetadata: MetadataAttribute = {
        name: input.name,
        type: input.type || ValueType.String,
      };
      if (!isUndefined(input.value)) {
        inputMetadata.value = input.value;
      }
      return inputMetadata;
    });
    flowMetadata.output = metadata.output.map(output => ({
      name: output.name,
      type: output.type || ValueType.String,
    }));
    return flowMetadata;
  }

  if (isFlowPath && isErrorPath) {
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.warn('Invalid path information in the given flow');
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.log(inFlow);
    return flowJSON;
  }

  const flowItems = inFlow.mainItems;
  const errorItems = inFlow.errorItems;
  if (isEmpty(flowItems) && isEmpty(errorItems)) {
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.warn('Invalid items information in the given flow');
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.log(inFlow);
    return flowJSON;
  }

  flowJSON.flow = (function _parseFlowInfo() {
    const flow = <LegacyFlow>{};

    flow.name = flowJSON.name; // TODO seems to be redundant
    // todo: not used?
    flow.model = get(inFlow, 'model', 'tibco-simple');
    // todo: not used?
    flow.type = get(inFlow, 'type', FLOGO_PROCESS_TYPE.DEFAULT);

    flow.attributes = _parseFlowAttributes(inFlow.attributes || []);

    flow.rootTask = (function _parseRootTask() {
      // in the input flow, the root is the trigger, hence create a rootTask here, and
      // make its id is always 1, along with the following default values;
      //
      //  TODO
      //    1. should handle the attribute mapping of trigger separately,
      //    hence will the rootTask has no mapping for the moment.
      const rootTask = <flowToJSON_RootTask>{
        id: 'root',
        type: FLOGO_TASK_TYPE.TASK, // this is 1
        activityType: '',
        ref: '',
        name: 'root',
        tasks: <flowToJSON_Task[]>[],
        links: <flowToJSON_Link[]>[]
      };

      const rootNode = flowPathNodes[flowPathRoot];

      /*
       * add the root node to tasks of the root flow as it now is an activity
       */
      if (isEmpty(rootNode)) {
        return rootTask;
      }

      const taskInfo = _prepareTaskInfo(<ItemActivityTask>flowItems[rootNode.id]);
      if (!isEmpty(taskInfo)) {
        rootTask.tasks.push(taskInfo);
      }

      _traversalDiagram(rootNode, flowPathNodes, flowItems, rootTask.tasks, rootTask.links);

      return rootTask;
    }());



    flow.errorHandlerTask = (function _parseErrorTask() {

      const errorTask = <flowToJSON_RootTask>{
        id: '__error_root',
        type: FLOGO_TASK_TYPE.TASK, // this is 1
        activityType: '',
        ref: '',
        name: 'error_root',
        tasks: <flowToJSON_Task[]>[],
        links: <flowToJSON_Link[]>[]
      };
      /*
       * add the root node to tasks of the root flow as it now is an activity
       */
      const rootNode = errorPathNodes[errorPathRoot];

      if (isEmpty(rootNode)) {
        return errorTask;
      }
      const taskInfo = _prepareTaskInfo(<ItemActivityTask>errorItems[rootNode.id]);
      if (!isEmpty(taskInfo)) {
        errorTask.tasks.push(taskInfo);
      }

      _traversalDiagram(rootNode, errorPathNodes, errorItems, errorTask.tasks, errorTask.links);

      return errorTask;
    }());

    return flow;
  }());

  if (_hasExplicitReply(flowJSON.flow && flowJSON.flow.rootTask && flowJSON.flow.rootTask.tasks)) {
    flowJSON.flow.explicitReply = true;
  }

  /* tslint:disable-next-line:no-unused-expression */
  INFO && console.log('Generated flow.json: ', flowJSON);

  function _traversalDiagram(rootNode: GraphNode,
                             nodes: Dictionary<GraphNode>,
                             tasks: Dictionary<Item>,
                             tasksDest: flowToJSON_Task[ ],
                             linksDest: flowToJSON_Link[ ]): void {

    const visited = < string[ ] > [];

    _traversalDiagramChildren(rootNode, visited, nodes, tasks, tasksDest, linksDest);
  }

  function _traversalDiagramChildren(node: GraphNode,
                                     visitedNodes: string[ ],
                                     nodes: Dictionary<GraphNode>,
                                     tasks: Dictionary<Item>,
                                     tasksDest: flowToJSON_Task[ ],
                                     linksDest: flowToJSON_Link[ ]) {
    // if haven't visited
    if (!includes(visitedNodes, node.id)) {
      visitedNodes.push(node.id);

      const nodesToGo = difference(node.children, visitedNodes);

      each(nodesToGo, (nid) => {

        const childNode = nodes[nid];

        // handle branch node differently
        if (childNode.type === NodeType.Branch) {
          const branch = tasks[childNode.id];

          // single child is found
          //  since branch can has only one direct child, this is the only case to follow
          if (branch && childNode.children.length === 1) {
            /* tslint:disable-next-line:no-unused-expression */
            DEBUG && console.log('Found a branch with activity!');

            // traversal its children
            _traversalDiagramChildren(childNode, visitedNodes, nodes, tasks, tasksDest, linksDest);
          } else {
            /* tslint:disable-next-line:no-unused-expression */
            DEBUG && console.warn('- Found a branch!\n- Don\'t care..');
          }

          return;
        }

        /*
         * add task
         */

        const taskInfo = _prepareTaskInfo(<ItemActivityTask>tasks[childNode.id]);
        if (!isEmpty(taskInfo)) {
          tasksDest.push(taskInfo);
        }

        /*
         * add link
         */

        if (node.type === NodeType.Task) {

          linksDest.push({
            id: _genLinkID(),
            from: convertTaskID(node.id),
            to: convertTaskID(childNode.id),
            type: FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.DEFAULT
          });

        } else if (node.type === NodeType.Branch && node.parents.length === 1) {

          const parentNode = nodes[node.parents[0]];
          const branch = tasks[node.id] as ItemBranch;

          linksDest.push({
            id: _genLinkID(),
            from: convertTaskID(parentNode.id),
            to: convertTaskID(childNode.id),
            type: FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH,
            value: branch.condition
          });

        }

        _traversalDiagramChildren(childNode, visitedNodes, nodes, tasks, tasksDest, linksDest);

      });
    }
  }

  function _isValidInternalTaskInfo(task: {
    id: string;
    type: FLOGO_TASK_TYPE;
    activityType?: string;
    ref?: string;
    [key: string]: any;
  }): boolean {

    if (isEmpty(task)) {
      /* tslint:disable-next-line:no-unused-expression */
      DEBUG && console.warn('Empty task');
      return false;
    }

    if (isEmpty(task.id)) {
      /* tslint:disable-next-line:no-unused-expression */
      DEBUG && console.warn('Empty task id');
      /* tslint:disable-next-line:no-unused-expression */
      DEBUG && console.log(task);
      return false;
    }

    if (!isNumber(task.type)) {
      /* tslint:disable-next-line:no-unused-expression */
      DEBUG && console.warn('Invalid task type');
      /* tslint:disable-next-line:no-unused-expression */
      DEBUG && console.log(task);
      return false;
    }

    if (isEmpty(task.ref)) {
      /* tslint:disable-next-line:no-unused-expression */
      DEBUG && console.warn('Empty task activityType');
      /* tslint:disable-next-line:no-unused-expression */
      DEBUG && console.log(task);
      return false;
    }

    return true;
  }

  function _parseFlowAttributes(inAttrs: any[]): flowToJSON_Attribute [] {
    const attributes = <flowToJSON_Attribute []>[];

    each(inAttrs, (inAttr: any) => {
      const attr = <flowToJSON_Attribute>{};

      /* simple validation */
      attr.name = <string>get(inAttr, 'name');
      attr.value = <any>get(inAttr, 'value', getDefaultValue(inAttr.type));
      attr.required = !!inAttr.required;

      if (isEmpty(attr.name)) {
        /* tslint:disable-next-line:no-unused-expression */
        DEBUG && console.warn('Empty attribute name found');
        /* tslint:disable-next-line:no-unused-expression */
        DEBUG && console.log(inAttr);
        return;
      }

      // NOTE
      //  empty value may be fed from upstream results - mapping
      //  hence comment out this validation
      // if ( !_.isNumber( attr.value ) && !_.isBoolean( attr.value ) && _.isEmpty( attr.value ) ) {
      //   DEBUG && console.warn( 'Empty attribute value found' );
      //   DEBUG && console.log( inAttr );
      //   return;
      // }

      // the attribute default attribute type is STRING
      attr.type = inAttr.type || ValueType.String;

      attributes.push(attr);
    });

    return attributes;
  }

  function _hasExplicitReply(tasks?: any): boolean {
    if (!tasks) {
      return false;
    }

    // hardcoding the activity type, for now
    // TODO: maybe the activity should expose a property so we know it can reply?
    return !!find(tasks, task => (<any>task).activityRef === 'github.com/TIBCOSoftware/flogo-contrib/activity/reply');

  }

  function _prepareTaskInfo(item: ItemTask) {
    // todo: remove schema === {} for subflow case
    const schema = <ActivitySchema> inFlow.schemas[item.ref] || <any>{};
    const task = mergeItemWithSchema(item, schema);
    const taskInfo = <flowToJSON_Task>{};
    if (_isValidInternalTaskInfo(task)) {
      taskInfo.id = convertTaskID(task.id);
      taskInfo.name = get(task, 'name', '');
      taskInfo.description = get(task, 'description', '');
      taskInfo.type = task.type;
      taskInfo.activityType = task.activityType || '';
      if (!isSubflowTask(task.type)) {
        taskInfo.activityRef = task.ref;
      }

      taskInfo.attributes = _parseFlowAttributes(<DiagramTaskAttribute[]>get(task, 'attributes.inputs'));

      /* add inputMappings */

      const inputMappings = _parseFlowMappings(<DiagramTaskAttributeMapping[]>get(task, 'inputMappings'));

      if (!isEmpty(inputMappings)) {
        taskInfo.inputMappings = inputMappings;
      }

      /* add outputMappings */

      const outputMappings = _parseFlowMappings(<DiagramTaskAttributeMapping[]>get(task, 'outputMappings'));

      if (!isEmpty(outputMappings)) {
        taskInfo.ouputMappings = outputMappings;
      }

      if (!isEmpty(task.settings)) {
        taskInfo.settings = cloneDeep(task.settings);
      }

    } else {
      /* tslint:disable-next-line:no-unused-expression */
      INFO && console.warn('Invalid task found.');
      /* tslint:disable-next-line:no-unused-expression */
      INFO && console.warn(task);
    }
    return taskInfo;
  }

  return flowJSON;
}

export function _parseFlowMappings(inMappings: any[] = []): flowToJSON_Mapping[] {
  return inMappings.reduce((parsedMappings: flowToJSON_Mapping[], inMapping: any) => {
    if (isValidMapping(inMapping)) {
      const parsedMapping: flowToJSON_Mapping = {
        type: inMapping.type, value: inMapping.value, mapTo: inMapping.mapTo
      };
      if (!isNumber(parsedMapping.type)) {
        console.warn('Force invalid mapping type to 1 since it is not a number.');
        console.log(parsedMapping);
        parsedMapping.type = 1;
      }
      parsedMappings.push(parsedMapping);
    }
    return parsedMappings;
  }, []);

  /* simple validation */
  function isValidMapping(mapping) {
    if (isUndefined(mapping.type)) {
      // DEBUG && console.warn('Empty mapping type found');
      // DEBUG && console.log(inMapping);
      return false;
    }

    if (isUndefined(mapping.value)) {
      return false;
    } else if (isString(mapping.value) && !trim(mapping.value)) {
      return false;
    }

    if (isEmpty(mapping.mapTo)) {
      // DEBUG && console.warn('Empty mapping mapTo found');
      // DEBUG && console.log(inMapping);
      return false;
    }
    return true;
  }
}
