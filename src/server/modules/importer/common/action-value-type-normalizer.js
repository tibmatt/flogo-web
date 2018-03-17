import isEmpty from 'lodash/isEmpty';
import set from 'lodash/get';
import { safeGetTasksInHandler } from '../../../common/utils/flow';
import { TASK_HANDLER_NAME_ROOT, TASK_HANDLER_NAME_ERROR } from '../../../common/constants';
import { normalizeValueType } from '../../../common/utils/value-type';

const normalizeAttrType = attr => ({ ...attr, type: normalizeValueType(attr.type) });

export function actionValueTypesNormalizer(action) {
  if (!action) {
    return action;
  }
  if (action.metadata) {
    action.metadata = normalizeMetadataValueTypes(action.metadata);
  }

  normalizeValueTypesForTasksInHandler(action, TASK_HANDLER_NAME_ROOT);
  normalizeValueTypesForTasksInHandler(action, TASK_HANDLER_NAME_ERROR);

  return action;
}

function normalizeMetadataValueTypes(metadata) {
  if (metadata.input) {
    metadata.input = metadata.input.map(normalizeAttrType);
  }
  if (metadata.output) {
    metadata.output = metadata.output.map(normalizeAttrType);
  }
  return metadata;
}

function normalizeValueTypesInTask(task) {
  if (task.attributes) {
    task.attributes = task.attributes.map(normalizeAttrType);
  }
  return task;
}

function normalizeValueTypesForTasksInHandler(action, handlerName) {
  const tasks = safeGetTasksInHandler(action, handlerName);
  if (!isEmpty(tasks)) {
    setTasksInHandler(action, TASK_HANDLER_NAME_ROOT, tasks.map(normalizeValueTypesInTask));
  }
}

function setTasksInHandler(action, handlerName, tasks) {
  return set(action, `data.flow.${handlerName}.tasks`, tasks);
}
