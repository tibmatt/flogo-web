import isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';
import {getInternalTasksPath, safeGetTasksInHandler} from '../../../common/utils/flow';
import { TASK_HANDLER_NAME_ROOT, TASK_HANDLER_NAME_ERROR } from '../../../common/constants';
import { normalizeValueType } from '../../../common/utils/value-type';
import {normalizeLinksWithMainBranch} from "./normalize-links-with-main-branch";

const normalizeAttrType = attr => ({ ...attr, type: normalizeValueType(attr.type) });

export function actionNormalizer(action) {
  if (!action) {
    return action;
  }
  if (action.metadata) {
    action.metadata = normalizeMetadataValueTypes(action.metadata);
  }

  normalizeValueTypesForTasksInHandler(action, TASK_HANDLER_NAME_ROOT);
  normalizeValueTypesForTasksInHandler(action, TASK_HANDLER_NAME_ERROR);

  normalizeLinksWithMainBranch(action, TASK_HANDLER_NAME_ROOT);
  normalizeLinksWithMainBranch(action, TASK_HANDLER_NAME_ERROR);

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
    set(action, getInternalTasksPath(handlerName), tasks.map(normalizeValueTypesInTask));
  }
}
