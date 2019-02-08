import { keyBy } from 'lodash';
import { REF_SUBFLOW, isSubflowTask, isMapperActivity } from '@flogo-web/server/core';
import { TaskFormatter } from './task-formatter';

export function formatTasks(activitySchemas, tasks = []) {
  const taskFormatter = new TaskFormatter();
  const schemas = keyBy(activitySchemas, 'ref');
  return tasks.map(task => {
    if (isSubflowTask(task)) {
      task = { ...task, activityRef: REF_SUBFLOW };
    }
    const isMapperType = isMapperActivity(schemas[task.activityRef]);
    return taskFormatter.setSourceTask(task).convert(isMapperType);
  });
}
