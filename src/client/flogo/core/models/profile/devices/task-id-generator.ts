import {calculateNextId} from '../calculate-next-id';

export function deviceTaskIdGenerator() {
  return (items?: any) => {
    let taskID: string;
    // TODO
    //  generate a more meaningful task ID in string format
    if (items) {
      taskID = calculateNextId(items);

    } else {
      // shift the timestamp for avoiding overflow 32 bit system
      /* tslint:disable-next-line:no-bitwise */
      taskID = '' + (Date.now() >>> 1);
    }

    return taskID;
  };
}
