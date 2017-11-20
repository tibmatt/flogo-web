import { FLOGO_TASK_TYPE } from '../../../common/constants';
import { flogoIDEncode } from '../../../common/utils';

export const TRIGGERS = [
  {
    'id' : flogoIDEncode( '1' ),
    'type' : FLOGO_TASK_TYPE.TASK_ROOT,
    'activityType' : '',
    'name' : 'HTTP Trigger',
    'settings': [
      {
        'name': 'port',
        'type': 'number'
      }
    ],
    'outputs': [
      {
        'name': 'params',
        'type': 'string'
      },
      {
        'name': 'content',
        'type': 'string'
      }
    ],
    'endpoint': {
      'settings': [
        {
          'name': 'method',
          'type': 'string'
        },
        {
          'name': 'path',
          'type': 'string'
        }
      ]
    }
  },
  {
    'id' : flogoIDEncode( '1' ),
    'type' : FLOGO_TASK_TYPE.TASK_ROOT,
    'activityType' : '',
    'name' : 'MQTT Trigger'
  }
];
