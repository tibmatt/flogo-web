import {Injectable} from '@angular/core';
import {AbstractProfileUtilityService} from '../profiles.utils.service';
import {flogoIDEncode} from '../../../utils';

@Injectable()
export class FlogoMicroserviceUtilsService extends AbstractProfileUtilityService {
  generateTaskID(items?: any, currentTask?: any) {
    let taskID = '';
    if ( items ) {
      if (currentTask) {
        taskID = currentTask.ref.split('/').pop() + '_';
      }
      taskID += this.getMaxCount(items, (item) => {
        return item.split('_').pop();
      });

    } else {
      // shift the timestamp for avoiding overflow 32 bit system
      taskID = '' + (Date.now() >>> 1);
    }

    return flogoIDEncode( taskID );
  }
}
