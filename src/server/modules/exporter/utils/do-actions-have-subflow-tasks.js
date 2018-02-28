import get from 'lodash/get';
import { FLOGO_TASK_TYPE } from '../../../common/constants';

export function appHasSubflowTask(app) {
  return !!app.actions.find(action => {
    let allTasks = [];
    allTasks = allTasks.concat(get(action, 'data.flow.rootTask.tasks', []));
    allTasks = allTasks.concat(get(action, 'data.flow.errorHandlerTask.tasks', []));
    return allTasks.find(task => task.type === FLOGO_TASK_TYPE.TASK_SUB_PROC);
  });
}
