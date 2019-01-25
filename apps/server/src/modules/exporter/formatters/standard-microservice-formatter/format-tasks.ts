import keyBy from 'lodash/keyBy';
import { TaskFormatter } from './task-formatter';
import { REF_SUBFLOW } from '../../../../common/constants';
import { isSubflowTask } from '../../../../common/utils/subflow';
import { isMapperActivity } from '../../../../common/utils/flow';

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
