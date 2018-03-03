import get from 'lodash/get';
import { isIterableTask } from '../../../common/utils';
import { FLOGO_TASK_TYPE } from '../../../common/constants';

export function portTaskTypesForLegacyIteratorTasks(action) {
  // TODO: should be done during import in importer.LegacyImporter
  fixIterableTasks(get(action, 'data.flow.rootTask.tasks', []));
  fixIterableTasks(get(action, 'data.flow.errorHandlerTask.tasks', []));
}

function fixIterableTasks(tasks) {
  return tasks
    .filter(shouldFixIterableTask)
    .forEach(task => {
      task.type = FLOGO_TASK_TYPE.TASK;
    });
}

function shouldFixIterableTask(task) {
  return isIterableTask(task) && task.type !== FLOGO_TASK_TYPE.TASK_SUB_PROC;
}
