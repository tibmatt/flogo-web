import keyBy from 'lodash/keyBy';
import { TaskFormatter } from './task-formatter';

export function formatTasks(activitySchemas, tasks = []) {
  const taskFormatter = new TaskFormatter();
  const schemas = keyBy(activitySchemas, 'ref');
  return tasks.map(task => taskFormatter
    .setSchemaInputs(schemas[task.activityRef].inputs || [])
    .setSourceTask(task)
    .convert(),
  );
}
