import { isEmpty } from 'lodash';
import { Dictionary, Item, isIterableTask, isSubflowTask } from '@flogo-web/client-core';

const isNotRunnableTask = task => isSubflowTask(task.type) || isIterableTask(task);
const findNotRunnableTasks = (tasks: Dictionary<Item>) =>
  !!Object.values(tasks).find(isNotRunnableTask);

export function determineRunnableStatus(
  mainItems: Dictionary<Item>,
  errorItems: Dictionary<Item>
) {
  const runnableInfo = {
    disabled: isEmpty(mainItems),
    disableReason: null,
  };
  if (runnableInfo.disabled) {
    return runnableInfo;
  }
  const hasNotRunnableTasks =
    findNotRunnableTasks(mainItems) || findNotRunnableTasks(errorItems);
  if (hasNotRunnableTasks) {
    runnableInfo.disabled = true;
    runnableInfo.disableReason = 'CANVAS:WARNING-UNSUPPORTED-TEST-RUN';
  } else {
    runnableInfo.disabled = false;
    runnableInfo.disableReason = null;
  }
  return runnableInfo;
}
