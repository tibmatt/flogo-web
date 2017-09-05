import {Injectable} from '@angular/core';
import {AbstractProfileUtilityService} from '../profiles.utils.service';
import {FLOGO_TASK_TYPE} from '../../../constants';
import {flogoIDDecode, flogoIDEncode} from '../../../utils';

@Injectable()
export class FlogoDeviceUtilsService extends AbstractProfileUtilityService {
  generateTaskID(items?: any) {
    let taskID: string;
    // TODO
    //  generate a more meaningful task ID in string format
    if ( items ) {
      taskID = this.getMaxCount(items);

    } else {
      // shift the timestamp for avoiding overflow 32 bit system
      taskID = '' + (Date.now() >>> 1);
    }

    return flogoIDEncode( taskID );
  }
}
