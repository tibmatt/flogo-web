import { isEmpty } from 'lodash';

export function isIterableTask(task) {
  return task && task.settings && !isEmpty(task.settings.iterate);
}
