import { FLOGO_TASK_TYPE } from '@flogo-web/lib-client/core';

export function isSubflowTask(taskType: FLOGO_TASK_TYPE): boolean {
  return taskType === FLOGO_TASK_TYPE.TASK_SUB_PROC;
}
