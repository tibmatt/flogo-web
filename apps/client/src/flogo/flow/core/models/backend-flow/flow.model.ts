import {
  difference,
  cloneDeep,
  find,
  get,
  each,
  includes,
  isEmpty,
  isNumber,
  isString,
  isUndefined
} from 'lodash';
import {
  convertTaskID,
  getDefaultValue,
  isSubflowTask,
} from '@flogo-web/client-shared/utils';

import {
  FlowMetadata,
  MetadataAttribute,
  FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE
} from '@flogo-web/client-core';
import { mergeItemWithSchema } from '@flogo-web/client-core/models';

import {
  AttributeMapping as DiagramTaskAttributeMapping,
  TaskAttribute as DiagramTaskAttribute,
  flowToJSON_Attribute,
  UiFlow,
  flowToJSON_Link,
  flowToJSON_Mapping,
  flowToJSON_Task,
  ValueType,
  FLOGO_TASK_TYPE,
  Dictionary,
  Item,
  ActivitySchema,
  ItemActivityTask,
  ItemBranch,
  ItemTask,
  FlowGraph,
  GraphNode,
  NodeType,
  Action,
} from '@flogo-web/client-core';

const DEBUG = false;
const INFO = true;

const generateDiagramTraverser = schemas => {
  const visited: string[] = [];
  const tasksDest: flowToJSON_Task[] = [];
  const linksDest: flowToJSON_Link[] = [];
  let idCounter = 0;
  const _genLinkId = () => ++idCounter;

  function _traversalDiagramChildren(
    node: GraphNode,
    nodes: Dictionary<GraphNode>,
    tasks: Dictionary<Item>
  ) {
    // if haven't visited
    if (!includes(visited, node.id)) {
      visited.push(node.id);

      const nodesToGo = difference(node.children, visited);

      each(nodesToGo, nid => {
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
            _traversalDiagramChildren(childNode, nodes, tasks);
          } else {
            /* tslint:disable-next-line:no-unused-expression */
            DEBUG && console.warn("- Found a branch!\n- Don't care..");
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
            id: _genLinkId(),
            from: convertTaskID(node.id),
            to: convertTaskID(childNode.id),
            type: FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.DEFAULT,
          });
        } else if (node.type === NodeType.Branch && node.parents.length === 1) {
          const parentNode = nodes[node.parents[0]];
          const branch = tasks[node.id] as ItemBranch;

          linksDest.push({
            id: _genLinkId(),
            from: convertTaskID(parentNode.id),
            to: convertTaskID(childNode.id),
            type: FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH,
            value: branch.condition,
          });
        }

        _traversalDiagramChildren(childNode, nodes, tasks);
      });
    }
  }

  function _prepareTaskInfo(item: ItemTask) {
    // todo: remove schema === {} for subflow case
    const schema = <ActivitySchema>schemas[item.ref] || <any>{};
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

      taskInfo.attributes = _parseFlowAttributes(<DiagramTaskAttribute[]>(
        get(task, 'attributes.inputs')
      ));

      /* add inputMappings */

      const inputMappings = parseFlowMappings(<DiagramTaskAttributeMapping[]>(
        get(task, 'inputMappings')
      ));

      if (!isEmpty(inputMappings)) {
        taskInfo.inputMappings = inputMappings;
      }

      /* add outputMappings */

      const outputMappings = parseFlowMappings(<DiagramTaskAttributeMapping[]>(
        get(task, 'outputMappings')
      ));

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

  return (rootNode: GraphNode, nodes: Dictionary<GraphNode>, tasks: Dictionary<Item>) => {
    const rootTaskInfo = _prepareTaskInfo(<ItemActivityTask>tasks[rootNode.id]);
    if (!isEmpty(rootTaskInfo)) {
      tasksDest.push(rootTaskInfo);
    }
    _traversalDiagramChildren(rootNode, nodes, tasks);
    return { tasks: tasksDest, links: linksDest };
  };
};

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

  if (!task.id) {
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

function _parseFlowAttributes(inAttrs: any[]): flowToJSON_Attribute[] {
  const attributes = <flowToJSON_Attribute[]>[];

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

/**
 * Convert the action to server model
 */
export function savableFlow(inFlow: UiFlow): Action {
  const flowJSON = <Action>{};
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
  const isMainFlowEmpty = isEmpty(flowPath) || !flowPathRoot || isEmpty(flowPathNodes);
  const isErrorFlowEmpty =
    isEmpty(errorPath) || !errorPathRoot || isEmpty(errorPathNodes);

  flowJSON.id = flowID;
  flowJSON.name = inFlow.name || '';
  flowJSON.description = inFlow.description || '';
  flowJSON.metadata = _parseMetadata(
    inFlow.metadata || {
      input: [],
      output: [],
    }
  );

  if (isMainFlowEmpty && isErrorFlowEmpty) {
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

  if (!isEmpty(flowItems)) {
    const rootNode = flowPathNodes[flowPathRoot];
    if (!isEmpty(rootNode)) {
      const _traversalDiagram = generateDiagramTraverser(inFlow.schemas);
      const { tasks, links } = _traversalDiagram(rootNode, flowPathNodes, flowItems);
      flowJSON.tasks = tasks as Action['tasks'];
      flowJSON.links = links;
    }
  }

  if (!isEmpty(errorItems)) {
    const rootNode = errorPathNodes[errorPathRoot];
    if (!isEmpty(rootNode)) {
      const _traversalDiagram = generateDiagramTraverser(inFlow.schemas);
      const { tasks, links } = _traversalDiagram(rootNode, errorPathNodes, errorItems);
      flowJSON.errorHandler = {
        tasks: tasks as Action['tasks'],
        links,
      };
    }
  }

  /* tslint:disable-next-line:no-unused-expression */
  INFO && console.log('Generated flow.json: ', flowJSON);

  return flowJSON;
}

function _hasExplicitReply(tasks?: any): boolean {
  if (!tasks) {
    return false;
  }

  // hardcoding the activity type, for now
  // TODO: maybe the activity should expose a property so we know it can reply?
  return !!find(
    tasks,
    task =>
      (<any>task).activityRef === 'github.com/TIBCOSoftware/flogo-contrib/activity/reply'
  );
}

function _parseMetadata(metadata: FlowMetadata): FlowMetadata {
  const flowMetadata: FlowMetadata = {
    input: [],
    output: [],
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

export function parseFlowMappings(inMappings: any[] = []): flowToJSON_Mapping[] {
  return inMappings.reduce((parsedMappings: flowToJSON_Mapping[], inMapping: any) => {
    if (!isValidMapping(inMapping)) {
      return parsedMappings;
    }
    const parsedMapping: flowToJSON_Mapping = {
      type: inMapping.type,
      value: inMapping.value,
      mapTo: inMapping.mapTo,
    };
    if (!isNumber(parsedMapping.type)) {
      console.warn('Force invalid mapping type to 1 since it is not a number.');
      console.log(parsedMapping);
      parsedMapping.type = 1;
    }
    parsedMappings.push(parsedMapping);
    return parsedMappings;
  }, []);

  /* simple validation */
  function isValidMapping(mapping) {
    if (isUndefined(mapping.type)) {
      return false;
    }

    if (isUndefined(mapping.value)) {
      return false;
    } else if (isString(mapping.value) && mapping.value.length === 0) {
      return false;
    }

    if (isEmpty(mapping.mapTo)) {
      return false;
    }
    return true;
  }
}
