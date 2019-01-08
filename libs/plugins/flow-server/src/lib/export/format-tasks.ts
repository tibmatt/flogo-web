import keyBy from 'lodash/keyBy';
import { TaskFormatter } from '../../../../../../apps/server/src/modules/exporter/formatters/standard-microservice-formatter/task-formatter';
import { REF_SUBFLOW } from '../../../../../../apps/server/src/common/constants';
import { isSubflowTask } from '../../../../../../apps/server/src/common/utils/subflow';
import { mappingsToAttributes } from '../../../../../../apps/server/src/modules/exporter/mappings-to-attributes';

export function formatTasks(activitySchemas, tasks = []) {
  const taskFormatter = new TaskFormatter();
  const schemas = keyBy(activitySchemas, 'ref');
  return tasks.map(task => {
    if (isSubflowTask(task)) {
      task = { ...task, activityRef: REF_SUBFLOW };
    }
    const activitySchema = schemas[task.activityRef];
    // preparing task attribute from inputMappings while formatting the tasks
    task = mappingsToAttributes(task, activitySchema);
    return taskFormatter
      .setSchemaInputs(activitySchema.inputs || [])
      .setSourceTask(task)
      .convert();
  });
}
