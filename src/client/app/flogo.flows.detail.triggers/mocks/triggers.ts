import { FLOGO_TASK_TYPE } from '../../../common/constants';
import { flogoIDEncode } from '../../../common/utils';

export const TRIGGERS = [
  {
    "id" : flogoIDEncode( "1" ),
    "type" : FLOGO_TASK_TYPE.TASK_ROOT,
    "activityType" : '',
    "name" : "HTTP Trigger"
  },
  {
    "id" : flogoIDEncode( "1" ),
    "type" : FLOGO_TASK_TYPE.TASK_ROOT,
    "activityType" : '',
    "name" : "MQTT Trigger"
  }
];
