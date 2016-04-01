import { FLOGO_ACTIVITY_TYPE, FLOGO_TASK_TYPE } from '../../../common/constants';

export const TRIGGERS = [
  {
    "id" : btoa( "1" ),
    "type" : FLOGO_TASK_TYPE.TASK_ROOT,
    "activityType" : FLOGO_ACTIVITY_TYPE.DEFAULT,
    "name" : "HTTP Trigger"
  },
  {
    "id" : btoa( "1" ),
    "type" : FLOGO_TASK_TYPE.TASK_ROOT,
    "activityType" : FLOGO_ACTIVITY_TYPE.DEFAULT,
    "name" : "MGTT Trigger"
  }
];

