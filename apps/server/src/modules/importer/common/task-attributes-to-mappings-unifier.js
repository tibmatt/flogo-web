import cloneDeep from 'lodash/cloneDeep';
import keyBy from 'lodash/keyBy';
import { TASK_HANDLER_NAME_ERROR, TASK_HANDLER_NAME_ROOT, TYPE_LITERAL_ASSIGNMENT } from '../../../common/constants';
import { isMapperActivity, safeGetTasksInHandler } from '../../../common/utils/flow';
import { isSubflowTask } from '../../../common/utils/subflow';

export function taskAttributesToMappingsUnifier(action, activitySchemas) {
  if (!action) {
    return action;
  }
  const schemas = keyBy(activitySchemas, 'ref');
  unifyTaskAttributesToMappings(action, TASK_HANDLER_NAME_ROOT, schemas);
  unifyTaskAttributesToMappings(action, TASK_HANDLER_NAME_ERROR, schemas);

  return action;
}

function unifyTaskAttributesToMappings(action, handlerName, schemas) {
  const tasks = safeGetTasksInHandler(action, handlerName);
  tasks
    .filter(task => !isSubflowTask(task) && !isMapperActivity(schemas[task.activityRef]))
    .forEach(task => {
      task.inputMappings = attributesToMappings(task.attributes, task.inputMappings);
    });
}

function attributesToMappings(attributes, mappings = []) {
  const inputMappings = cloneDeep(mappings);
  const mappingsReference = keyBy(mappings, 'mapTo');
  return inputMappings.concat(
    attributes
      .filter(attr => !mappingsReference[attr.name])
      .map(attr => ({
        mapTo: attr.name,
        type: TYPE_LITERAL_ASSIGNMENT,
        value: attr.value,
      }))
  );
}
