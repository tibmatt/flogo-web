import { AbstractTaskIdGenerator } from '../profile-utils';

export class FlogoDeviceTaskIdGeneratorService extends AbstractTaskIdGenerator {
  generateTaskID(items?: any) {
    let taskID: string;
    // TODO
    //  generate a more meaningful task ID in string format
    if (items) {
      taskID = this.calculateNextId(items);

    } else {
      // shift the timestamp for avoiding overflow 32 bit system
      /* tslint:disable-next-line:no-bitwise */
      taskID = '' + (Date.now() >>> 1);
    }

    return taskID;
  }
}
