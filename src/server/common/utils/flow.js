import get from 'lodash/get';
import isObject from 'lodash/isObject';
import {TASK_HANDLER_NAME_ROOT} from "../constants";

/**
 * Finds out if an activity schema represents a mapper activity.
 * To be considered a mapper activity the schema should have at least one input property that declares
 * a display.mapper property as true.
 * @example
 *  {
 *    input: [ {
 *      name: "prop",
 *      type: "array",
 *      "display": {
 *           "description": "Return Mapping",
 *           "name": "Mapper",
 *           "type": "mapper",
 *           "mapper_output_scope" : "action.output"
 *         }
 *      } ]
 *  }
 * @param activitySchema
 * @return {boolean}
 */
export function isMapperActivity(activitySchema) {
  const hasOutputMapperDefinition = get(activitySchema, 'inputs', []).find(isOutputMapperField);
  return Boolean(hasOutputMapperDefinition);
}

export function isOutputMapperField(inputDefinition) {
  if (isObject(inputDefinition.display)) {
    return inputDefinition.display.type === 'mapper';
  }
  return false;
}

export function safeGetTasksInHandler(action, handler) {
  return get(action, getInternalTasksPath(handler), []);
}

export function getInternalTasksPath(handler) {
  if (handler === TASK_HANDLER_NAME_ROOT) {
    return 'tasks';
  }
  return `${handler}.tasks`;
}
