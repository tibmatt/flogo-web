import {
  assign,
  get,
  isObject,
  isUndefined,
  uniqueId,
  cloneDeep,
  each,
  isEmpty,
  trimStart,
} from 'lodash';
import { ValueType, FLOGO_TASK_TYPE } from '../constants';
import { Task, Item } from '../interfaces';

export function flogoGenTriggerID(): string {
  return `Flogo::Trigger::${Date.now()}`;
}

export function flogoGenNodeID() {
  return uniqueId(`FlogoFlowDiagramNode::${Date.now()}::`);
}

/**
 * get default value of a given type
 */
export function getDefaultValue(forType: ValueType): any {
  return ValueType.defaultValueForType.get(forType);
}

function portAttribute(
  inAttr: {
    type: string;
    value: any;
    [key: string]: any;
  },
  withDefault = false
) {
  const outAttr = <
    {
      type: any;
      value: any;
      [key: string]: any;
    }
  >assign({}, inAttr);

  if (withDefault && isUndefined(outAttr.value)) {
    outAttr.value = getDefaultValue(outAttr.type);
  }

  return outAttr;
}

/**
 * Finds out if an activity schema represents a mapper activity.
 * To be considered a mapper activity the schema should have at least one input property that declares
 * a display.mapper propert as true.
 * @example
 *  {
 *    input: [ {
 *      name: "prop",
 *      type: "array",
 *      "display": {
 *           "description": "Return Mapping",
 *           "name": "Mapper",
 *           "type": "mapper",
 *           "mapper_output_scope" : "action.ouput"
 *         }
 *      } ]
 *  }
 * @param activitySchema
 * @return {boolean}
 */
export function isMapperActivity(activitySchema: any) {
  const hasOutputMapperDefinition = get(activitySchema, 'inputs', []).find(
    isOutputMapper
  );
  return Boolean(hasOutputMapperDefinition);

  function isOutputMapper(inputDefinition) {
    if (isObject(inputDefinition.display)) {
      return inputDefinition.display.type === 'mapper';
    }
    return false;
  }
}

export function activitySchemaToTask(schema: any): any {
  const task: any = {
    type: FLOGO_TASK_TYPE.TASK,
    activityType: get(schema, 'name', ''),
    ref: schema.ref,
    name: get(schema, 'title', get(schema, 'name', 'Activity')),
    version: get(schema, 'version', ''),
    description: get(schema, 'description', ''),
    homepage: get(schema, 'homepage', ''),
    attributes: {
      inputs: cloneDeep(get(schema, 'inputs', [])),
      outputs: cloneDeep(get(schema, 'outputs', [])),
    },
    return: schema.return,
  };

  if (!isMapperActivity(schema)) {
    task.inputMappings = get(schema, 'inputs', [])
      .filter(attribute => !isUndefined(attribute.value))
      .reduce((inputs, attribute) => {
        inputs[attribute.name] = attribute.value;
        return inputs;
      }, {});
  }

  each(task.attributes.inputs, (input: any) => {
    // convert to task enumeration and provision default types
    assign(input, portAttribute(input, true));
  });

  each(task.attributes.outputs, (output: any) => {
    // convert to task enumeration and provision default types
    assign(output, portAttribute(output));
  });

  return task;
}

export function activitySchemaToTrigger(schema: any): any {
  const trigger: any = {
    type: FLOGO_TASK_TYPE.TASK_ROOT,
    triggerType: get(schema, 'name', ''),
    ref: schema.ref,
    name: get(schema, 'title', get(schema, 'name', 'Activity')),
    version: get(schema, 'version', ''),
    description: get(schema, 'description', ''),
    homepage: get(schema, 'homepage', ''),
    settings: get(schema, 'settings', ''),
    outputs: get(schema, 'outputs', ''),
    handler: { settings: get(schema, 'handler.settings', []) }, // ,
    // __schema: cloneDeep(schema)
  };

  each(trigger.inputs, (input: any) => {
    // convert to task enumeration and provision default types
    assign(input, portAttribute(input, true));
  });

  each(trigger.outputs, (output: any) => {
    // convert to task enumeration and provision default types
    assign(output, portAttribute(output));
  });

  return trigger;
}

export function parseMapping(mappingValue: string) {
  // todo: support other scopes,: flow, env, property, etc.
  const processExprTail = (tail: string) => (tail ? trimStart(tail, '.') : null);
  let taskId = null;
  let attributeName;
  let exprTail;
  let autoMap;

  const matchesActivity = /(\${activity\.([\w-]+)\.([\w-]+)}((?:\.[\w-]+)*))/.exec(
    mappingValue
  );
  if (matchesActivity) {
    taskId = matchesActivity[2] || null;
    attributeName = matchesActivity[3];
    exprTail = processExprTail(matchesActivity[4]);
    autoMap = `_A.${taskId}.${attributeName}`;
    return {
      autoMap,
      isRoot: false,
      taskId,
      attributeName,
      path: exprTail,
    };
  }

  const matchesTrigger = /(\${trigger\.([\w-]+)}((?:\.[\w-]+)*))/.exec(mappingValue);
  if (matchesTrigger) {
    attributeName = matchesTrigger[2] || null;
    autoMap = `_T.${attributeName}`;
    exprTail = processExprTail(matchesTrigger[3]);
    return {
      autoMap,
      isRoot: true,
      taskId,
      attributeName,
      path: exprTail,
    };
  }

  return null;
}

export function createSubFlowTask(schema: any) {
  return {
    type: FLOGO_TASK_TYPE.TASK_SUB_PROC,
    name: get(schema, 'title', get(schema, 'name', 'Start a Subflow')),
    ref: schema.ref,
    version: '',
    description: get(schema, 'description', ''),
    homepage: '',
    attributes: {
      inputs: [],
      outputs: [],
    },
    return: false,
  };
}

export function isSubflowTask(taskType: FLOGO_TASK_TYPE): boolean {
  return taskType === FLOGO_TASK_TYPE.TASK_SUB_PROC;
}

export function isIterableTask(task: Task | Item): boolean {
  return !isEmpty(get(task, 'settings.iterate'));
}

export function isBranchConfigured(branchCondition): boolean {
  return branchCondition && branchCondition !== 'true';
}
