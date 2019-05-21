import {
  isEmpty,
  isUndefined,
  includes,
  difference,
  each,
  cloneDeep,
  isNumber,
  get,
  isString,
} from 'lodash';
import { ValueType, Metadata, MetadataAttribute, ActivitySchema } from '@flogo-web/core';
import {
  FlowGraph as StreamGraph,
  Dictionary,
  flowToJSON_Task as streamToJSON_Task,
  flowToJSON_Link as streamToJSON_Link,
  GraphNode,
  NodeType,
  flowToJSON_Attribute as streamToJSON_Attribute,
  getDefaultValue,
  flowToJSON_Mapping as streamToJSON_Mapping,
} from '@flogo-web/lib-client/core';

const DEBUG = false;
const INFO = true;

const generateDiagramTraverser = schemas => {
  const visited: string[] = [];
  const tasksDest: streamToJSON_Task[] = [];
  const linksDest: streamToJSON_Link[] = [];
  let idCounter = 0;
  const _genLinkId = () => ++idCounter;

  function _traversalDiagramChildren(
    node: GraphNode,
    nodes: Dictionary<GraphNode>,
    tasks
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

        const taskInfo = _prepareTaskInfo(tasks[childNode.id]);
        if (!isEmpty(taskInfo)) {
          tasksDest.push(taskInfo);
        }

        /*
         * add link
         */

        if (node.type === NodeType.Task) {
          linksDest.push({
            id: _genLinkId(),
            from: node.id,
            to: childNode.id,
            type: 0,
          });
        } else if (node.type === NodeType.Branch && node.parents.length === 1) {
          const parentNode = nodes[node.parents[0]];
          const branch = tasks[node.id];

          linksDest.push({
            id: _genLinkId(),
            from: parentNode.id,
            to: childNode.id,
            type: 1,
            value: branch.condition,
          });
        }

        _traversalDiagramChildren(childNode, nodes, tasks);
      });
    }
  }

  function _prepareTaskInfo(item) {
    // todo: remove schema === {} for subflow case
    const schema = <ActivitySchema>schemas[item.ref] || <any>{};
    const task: any = mergeItemWithSchema(item, schema);
    const taskInfo = <streamToJSON_Task>{};
    if (_isValidInternalTaskInfo(task)) {
      taskInfo.id = task.id;
      taskInfo.name = get(task, 'name', '');
      taskInfo.description = get(task, 'description', '');
      taskInfo.type = task.type;
      taskInfo.activityType = task.activityType || '';
      if (task.type === 4) {
        taskInfo.activityRef = task.ref;
      }

      taskInfo.attributes = _parseStreamAttributes(get(task, 'attributes.inputs'));

      /* add inputMappings */

      const inputMappings = get(task, 'inputMappings', {});
      const activitySettings = get(task, 'activitySettings', {});

      if (!isEmpty(inputMappings)) {
        taskInfo.inputMappings = inputMappings;
      }
      if (!isEmpty(activitySettings)) {
        taskInfo.activitySettings = activitySettings;
      }
      /* add outputMappings */

      const outputMappings = parseStreamMappings(get(task, 'outputMappings'));

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

  return (rootNode: GraphNode, nodes: Dictionary<GraphNode>, tasks) => {
    const rootTaskInfo = _prepareTaskInfo(tasks[rootNode.id]);
    if (!isEmpty(rootTaskInfo)) {
      tasksDest.push(rootTaskInfo);
    }
    _traversalDiagramChildren(rootNode, nodes, tasks);
    return { tasks: tasksDest, links: linksDest };
  };
};

export function savableStream(inStream) {
  if (!inStream || isEmpty(inStream.id)) {
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.error('No id in the given stream');
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.log(inStream);
    return {};
  }

  const resource: any = {
    id: inStream.id,
    type: 'stream',
    name: inStream.name || '',
    description: inStream.description || '',
    metadata: _parseMetadata(
      inStream.metadata || {
        input: [],
        output: [],
      }
    ),
    data: {},
  };

  const mainHandler = buildHandler(inStream.mainGraph, inStream.mainItems, inStream);
  if (mainHandler) {
    resource.data.tasks = mainHandler.tasks;
    resource.data.links = mainHandler.links;
  }

  const errorHandler = buildHandler(inStream.errorGraph, inStream.errorItems, inStream);
  if (errorHandler) {
    resource.data.errorHandler = {
      tasks: errorHandler.tasks,
      links: errorHandler.links,
    };
  }

  return resource;
}

function _parseMetadata(metadata: Metadata): Metadata {
  const streamMetadata: Metadata = {
    input: [],
    output: [],
  };
  streamMetadata.input = metadata.input.map(input => {
    const inputMetadata: MetadataAttribute = {
      name: input.name,
      type: input.type || ValueType.String,
    };
    if (!isUndefined(input.value)) {
      inputMetadata.value = input.value;
    }
    return inputMetadata;
  });
  streamMetadata.output = metadata.output.map(output => ({
    name: output.name,
    type: output.type || ValueType.String,
  }));
  return streamMetadata;
}

function buildHandler(graph: StreamGraph, streamItems, inStream) {
  const streamPathRoot = graph.rootId;
  const streamPathNodes = graph.nodes;
  const isHandlerEmpty = isEmpty(graph) || !streamPathRoot || isEmpty(streamPathNodes);
  if (!isHandlerEmpty && !isEmpty(streamItems)) {
    const rootNode = streamPathNodes[streamPathRoot];
    if (!isEmpty(rootNode)) {
      const _traversalDiagram = generateDiagramTraverser(inStream.schemas);
      return _traversalDiagram(rootNode, streamPathNodes, streamItems);
    }
  }
  return null;
}

function mergeItemWithSchema(item, schema) {
  item = cloneDeep(item);
  schema = cloneDeep(schema);
  const itemInput = item.input || {};
  const schemaInputs = schema.inputs || [];
  const inputs = schemaInputs.map(input => {
    const value = itemInput[input.name];
    return { ...input, value };
  });
  return {
    id: item.id,
    type: item.type,
    version: schema.version,
    name: item.name,
    activityRef: item.ref,
    ref: item.ref,
    description: item.description,
    attributes: {
      inputs,
      outputs: schema.outputs,
    },
    activitySettings: item.activitySettings,
    inputMappings: item.inputMappings,
    settings: item.settings,
    __props: {},
    __status: {},
  };
}

function _isValidInternalTaskInfo(task: {
  id: string;
  type;
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

function _parseStreamAttributes(inAttrs: any[]): streamToJSON_Attribute[] {
  const attributes = <streamToJSON_Attribute[]>[];

  each(inAttrs, (inAttr: any) => {
    const attr = <streamToJSON_Attribute>{};

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

    // the attribute default attribute type is STRING
    attr.type = inAttr.type || ValueType.String;

    attributes.push(attr);
  });

  return attributes;
}

function parseStreamMappings(inMappings: any[] = []): streamToJSON_Mapping[] {
  return inMappings.reduce((parsedMappings: streamToJSON_Mapping[], inMapping: any) => {
    if (!isValidMapping(inMapping)) {
      return parsedMappings;
    }
    const parsedMapping: streamToJSON_Mapping = {
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
