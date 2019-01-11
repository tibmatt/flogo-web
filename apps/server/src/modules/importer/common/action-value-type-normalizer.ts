import isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';
import { getInternalTasksPath, safeGetTasksInHandler } from '../../../common/utils/flow';
import {
  TASK_HANDLER_NAME_ROOT,
  TASK_HANDLER_NAME_ERROR,
} from '../../../common/constants';
import { normalizeValueType } from '../../../common/utils/value-type';

const normalizeAttrType = attr => ({
  ...attr,
  type: normalizeValueType(attr.type),
});

export function actionValueTypesNormalizer(action) {
  if (!action) {
    return action;
  }
  if (action.metadata) {
    action.metadata = normalizeMetadataValueTypes(action.metadata);
  }

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
