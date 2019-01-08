import keyBy from 'lodash/keyBy';
import { TaskFormatter } from './task-formatter';
import { REF_SUBFLOW } from '../../../../common/constants';
import { isSubflowTask } from '../../../../common/utils/subflow';
import { mappingsToAttributes } from '../../mappings-to-attributes';

export function formatTasks(activitySchemas, tasks = []) {
  const taskFormatter = new TaskFormatter();
  const schemas = keyBy(activitySchemas, 'ref');
  return tasks.map(task => {
    if (isSubflowTask(task)) {
      task = { ...task, activityRef: REF_SUBFLOW };
    }
    const activitySchema = schemas[task.activityRef];
    return taskFormatter
      .setSchemaInputs(activitySchema.inputs || {})
      .setSourceTask(task)
      .convert(activitySchema);
  });
}
