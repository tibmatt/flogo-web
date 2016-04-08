import { FLOGO_ACTIVITY_TYPE, FLOGO_TASK_TYPE } from '../../../common/constants';
import { flogoIDEncode } from '../../../common/utils';

export const TRIGGERS = [
  {
    "id" : flogoIDEncode( "1" ),
    "type" : FLOGO_TASK_TYPE.TASK_ROOT,
    "activityType" : FLOGO_ACTIVITY_TYPE.DEFAULT,
    "name" : "HTTP Trigger"
  },
  {
    "id" : flogoIDEncode( "1" ),
    "type" : FLOGO_TASK_TYPE.TASK_ROOT,
    "activityType" : FLOGO_ACTIVITY_TYPE.DEFAULT,
    "name" : "MGTT Trigger"
  }
];

