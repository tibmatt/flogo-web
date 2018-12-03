import { Task } from '../../../interfaces';
import { isIterableTask } from '../../../common/utils';
import { FLOGO_TASK_TYPE } from '../../../common/constants';

export function portTaskTypeForIterators(task: Task): Task {
  if (isIterableTask(task) && task.type !== FLOGO_TASK_TYPE.TASK_SUB_PROC) {
    task.type = FLOGO_TASK_TYPE.TASK;
  }
  return task;
}
