import { FLOGO_TASK_TYPE, ValueType } from '@flogo/core/constants';
import { flogoIDEncode } from '@flogo/shared/utils';

export let MOCK_TASKS = [
  {
    'id' : flogoIDEncode( '2' ),
    'type' : FLOGO_TASK_TYPE.TASK,
    'activityType' : 'log',
    'name' : 'Log Start',
    'attributes' : {
      'inputs' : [
        {
          'type' : ValueType.String,
          'name' : 'message',
          'title' : 'Message',
          'value' : 'Find Pet Process Started!'
        },
        {
          'type' : ValueType.Boolean,
          'name' : 'processInfo',
          'title' : 'Process info',
          'value' : 'true'
        }
      ]
    }
  },
  {
    'id' : flogoIDEncode( '3' ),
    'type' : FLOGO_TASK_TYPE.TASK,
    'activityType' : 'rest',
    'name' : 'Pet Query',
    'attributes' : {
      'inputs' : [
        {
          'type' : ValueType.String,
          'name' : 'uri',
          'title' : 'URI',
          'value' : 'http://petstore.swagger.io/v2/pet/{petId}'
        },
        {
          'type' : ValueType.String,
          'name' : 'method',
          'title' : 'Method',
          'value' : 'GET'
        },
        {
          'type' : ValueType.String,
          'name' : 'petId',
          'title' : 'Pet ID',
          'value' : '201603311111'
        }
      ],
      'outputs' : [
        {
          'type' : ValueType.Object,
          'name' : 'result',
          'title' : 'Result',
          'value' : ''
        }
      ]
    },
    'inputMappings' : [
      {
        'type' : 1,
        'value' : 'petId',
        'mapTo' : 'petId'
      }
    ],
    'outputMappings' : [
      {
        'type' : 1,
        'value' : 'result',
        'mapTo' : 'petInfo'
      }
    ]
  },
  {
    'id' : flogoIDEncode( '4' ),
    'type' : FLOGO_TASK_TYPE.TASK,
    'activityType' : 'log',
    'name' : 'Log Results',
    'attributes' : {
      'inputs' : [
        {
          'type' : ValueType.String,
          'name' : 'message',
          'title' : 'Message',
          'value' : 'REST results'
        },
        {
          'type' : ValueType.Boolean,
          'name' : 'processInfo',
          'title' : 'Process Info',
          'value' : 'true'
        }
      ]
    },
    'inputMappings' : [
      {
        'type' : 1,
        'value' : 'petInfo',
        'mapTo' : 'message'
      }
    ]
  }
];
