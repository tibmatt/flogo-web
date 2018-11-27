import { assign, cloneDeep, each, get, isEmpty, isObject, isUndefined, kebabCase, uniqueId, trimStart } from 'lodash';
import { ValueType, FLOGO_TASK_TYPE, FLOGO_PROFILE_TYPE } from '@flogo-web/client/core/constants';
import { Item, Task } from '@flogo-web/client/core';
import {TYPE_LITERAL_ASSIGNMENT} from '@flogo-web/client/flow/shared/mapper';

export function flogoGenTriggerID(): string {
  return `Flogo::Trigger::${Date.now()}`;
}

export function flogoGenNodeID() {
  return uniqueId(`FlogoFlowDiagramNode::${Date.now()}::`);
}


/**
 * Convert task ID to integer, which is the currently supported type in engine
 * TODO
 *  taskID should be string in the future, perhaps..
 *
 * @param taskID
 * @returns {number}
 * @private
 */
export function convertTaskID(taskID: string) {
  return taskID;
}

// get default value of a given type
export function getDefaultValue(forType: ValueType): any {
  return ValueType.defaultValueForType.get(forType);
}

// convert the type of attribute and add default value if enabled
function portAttribute(inAttr: {
  type: string;
  value: any;
  [key: string]: any;
}, withDefault = false) {

  const outAttr = <{
    type: any;
    value: any;
    [key: string]: any;
  }>assign({}, inAttr);

  if (withDefault && isUndefined(outAttr.value)) {
    outAttr.value = getDefaultValue(outAttr.type);
  }

  return outAttr;
}

// todo: add schema
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
  const hasOutputMapperDefinition = get(activitySchema, 'inputs', []).find(isOutputMapper);
  return Boolean(hasOutputMapperDefinition);

  function isOutputMapper(inputDefinition) {
    if (isObject(inputDefinition.display)) {
      return inputDefinition.display.type === 'mapper';
    }
    return false;
  }
}

// mapping from schema.json of activity to the task can be used in flow.json
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
      outputs: cloneDeep(get(schema, 'outputs', []))
    },
    return: schema.return
  };

  if (!isMapperActivity(schema)) {
    task.inputMappings = get(schema, 'inputs', []).filter(attribute => !isUndefined(attribute.value))
      .map(attribute => ({
        'mapTo': attribute.name,
        'type': TYPE_LITERAL_ASSIGNMENT,
        'value': attribute.value
      }));
  }

  each(
    task.attributes.inputs, (input: any) => {
      // convert to task enumeration and provision default types
      assign(input, portAttribute(input, true));
    }
  );

  each(
    task.attributes.outputs, (output: any) => {
      // convert to task enumeration and provision default types
      assign(output, portAttribute(output));
    }
  );

  return task;
}

// mapping from schema.json of activity to the trigger can be used in flow.json
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
    handler: { settings: get(schema, 'handler.settings', []) } // ,
    // __schema: cloneDeep(schema)
  };

  each(
    trigger.inputs, (input: any) => {
      // convert to task enumeration and provision default types
      assign(input, portAttribute(input, true));
    }
  );

  each(
    trigger.outputs, (output: any) => {
      // convert to task enumeration and provision default types
      assign(output, portAttribute(output));
    }
  );


  return trigger;
}

// todo: name and location are too general and use case too specific
export function objectFromArray(arr, copyValues?) {
  const mappedSettings = {};
  const settings = arr || [];

  settings.forEach((setting) => {
    mappedSettings[setting.name] = copyValues ? setting.value : null;
  });

  return mappedSettings;
}

export function normalizeTaskName(taskName: string) {
  return kebabCase(taskName);
}

export function parseMapping(mappingValue: string) {
  // todo: support other scopes,: flow, env, property, etc.
  const processExprTail = (tail: string) => tail ? trimStart(tail, '.') : null;
  let taskId = null;
  let attributeName;
  let exprTail;
  let autoMap;

  const matchesActivity = /(\${activity\.([\w-]+)\.([\w-]+)}((?:\.[\w-]+)*))/.exec(mappingValue);
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
      path: exprTail
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
      path: exprTail
    };
  }

  return null;

}

export function formatServerConfiguration(config: any) {
  return {
    db: {
      protocol: config.db.protocol,
      host: config.db.host,
      port: config.db.port,
      name: config.db.testPath,
      label: config.db.label
    },
    activities: {
      protocol: config.activities.protocol,
      host: config.activities.host,
      port: config.activities.port,
      testPath: config.activities.testPath,
      label: config.activities.label,
      db: {
        port: config.activities.port,
        name: config.activities.testPath
      }
    },
    triggers: {
      protocol: config.triggers.protocol,
      host: config.triggers.host,
      port: config.triggers.port,
      testPath: config.triggers.testPath,
      label: config.triggers.label,
      db: {
        port: config.triggers.port,
        name: config.triggers.testPath
      },
    },
    engine: {
      protocol: config.engine.protocol,
      host: config.engine.host,
      port: config.engine.port,
      testPath: config.engine.testPath
    },
    stateServer: {
      protocol: config.stateServer.protocol,
      host: config.stateServer.host,
      port: config.stateServer.port,
      testPath: config.stateServer.testPath
    },
    flowServer: {
      protocol: config.flowServer.protocol,
      host: config.flowServer.host,
      port: config.flowServer.port,
      testPath: config.flowServer.testPath
    }
  };
}

export function getURL(config: {
  protocol?: string;
  host?: string;
  port?: string;
}): string {
  if (config.port) {
    return `${config.protocol || location.protocol.replace(':', '')}://${config.host || location.hostname}:${config.port}`;
  } else {
    return `${config.protocol || location.protocol.replace(':', '')}://${config.host || location.hostname}}`;
  }
}

/**
 * Copies content of an element into the system clipboard.
 * (Taken from UI cloud pattern library)
 *
 * Not all browsers may be supported. See the following for details:
 * http://caniuse.com/clipboard
 * https://developers.google.com/web/updates/2015/04/cut-and-copy-commands
 * @param  {HTMLElement} element The element containing the text to copy
 * @return {boolean} whether the copy operation is succeeded
 */
export function copyToClipboard(element: HTMLElement) {
  const sel = window.getSelection();
  const snipRange = document.createRange();
  snipRange.selectNodeContents(element);
  sel.removeAllRanges();
  sel.addRange(snipRange);
  let res = false;
  try {
    res = document.execCommand('copy');
  } catch (err) {
    // copy command is not available
    console.error(err);
  }
  sel.removeAllRanges();
  return res;
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
      outputs: []
    },
    return: false
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

export function getProfileType(app) {
  let profileType: FLOGO_PROFILE_TYPE;
  if (app.device) {
    profileType = FLOGO_PROFILE_TYPE.DEVICE;
  } else {
    profileType = FLOGO_PROFILE_TYPE.MICRO_SERVICE;
  }
  return profileType;
}
