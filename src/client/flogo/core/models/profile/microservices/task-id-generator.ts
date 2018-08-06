import {calculateNextId} from '../calculate-next-id';

export function microserviceTaskIdGenerator(items?: any, currentTask?: any) {
  let taskID = '';
  if (items) {
    if (currentTask) {
      taskID = currentTask.ref.split('/').pop() + '_';
    }
    taskID += calculateNextId(items, (item) => {
      return item.split('_').pop();
    });

  } else {
    // shift the timestamp for avoiding overflow 32 bit system
    // tslint:disable-next-line:no-bitwise
    taskID = '' + (Date.now() >>> 1);
  }

  return taskID;
}
