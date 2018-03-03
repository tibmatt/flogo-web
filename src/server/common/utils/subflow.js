import get from 'lodash/get';
import { FLOGO_TASK_TYPE } from '../constants';

export function appHasSubflowTasks(app) {
  return !!app.actions.find(actionHasSubflowTasks);
}

export function actionHasSubflowTasks(action) {
  return !!safeGetTasksInHandler(action, 'rootTask').find(isSubflowTask)
    || !!safeGetTasksInHandler(action, 'errorHandlerTask').find(isSubflowTask);
}

export function isSubflowTask(task) {
  return task.type === FLOGO_TASK_TYPE.TASK_SUB_PROC;
}

/**
 *
 * @param action
 * @param {Function} onSubflowTask
 */
export function forEachSubflowTaskInAction(action, onSubflowTask) {
  const iterateOn = taskArray => taskArray.filter(isSubflowTask).forEach(task => onSubflowTask(task));
  iterateOn(safeGetTasksInHandler(action, 'rootTask'));
  iterateOn(safeGetTasksInHandler(action, 'errorHandlerTask'));
}

function safeGetTasksInHandler(from, handler) {
  return get(from, `data.flow.${handler}.tasks`, []);
}
