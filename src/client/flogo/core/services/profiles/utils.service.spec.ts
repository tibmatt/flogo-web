import { FlogoMicroserviceTaskIdGeneratorService } from './microservices/utils.service';
import { AbstractTaskIdGenerator } from './profiles.utils.service';
import { FlogoDeviceTaskIdGeneratorService } from './devices/utils.service';

const mockTasksAvailable = {
  'RmxvZ286OlRyaWdnZXI6OjE1MDQ2Mjg3ODI1NzU': {
    'name': 'Timer',
    'title': 'Timer',
    'version': '0.0.1',
    'homepage': 'https://github.com/TIBCOSoftware/flogo-contrib/tree/master/trigger/timer',
    'description': 'Simple Timer trigger',
    'installed': true,
    'settings': [],
    'outputs': [
      {
        'name': 'params',
        'type': 6,
        'value': null
      },
      {
        'name': 'content',
        'type': 4,
        'value': null
      }
    ],
    'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/timer',
    'handler': {
      'settings': [
        {
          'name': 'repeating',
          'type': 'string',
          'value': '10',
          'required': true
        },
        {
          'name': 'notImmediate',
          'type': 'string',
          'value': null
        },
        {
          'name': 'startDate',
          'type': 'string',
          'value': null
        },
        {
          'name': 'hours',
          'type': 'string',
          'value': null
        },
        {
          'name': 'minutes',
          'type': 'string',
          'value': null
        },
        {
          'name': 'seconds',
          'type': 'string',
          'value': null
        }
      ]
    },
    '__props': {
      'errors': [],
      'warnings': [],
      'outputs': [
        {
          'name': 'params',
          'type': 6,
          'value': null
        },
        {
          'name': 'content',
          'type': 4,
          'value': null
        }
      ]
    },
    '__status': {
      'isRunning': false,
      'hasRun': false
    },
    'id': 'RmxvZ286OlRyaWdnZXI6OjE1MDQ2Mjg3ODI1NzU',
    'nodeId': 'RmxvZ286OlRyaWdnZXI6OjE1MDQ2Mjg3ODI1NzU',
    'type': 0,
    'triggerType': 'tibco-timer'
  }
};
const mockSelectedTask = {
  'name': 'tibco-counter',
  'version': '0.0.1',
  'title': 'Increment Counter',
  'description': 'Simple Global Counter Activity',
  'ref': 'github.com/TIBCOSoftware/flogo-contrib/tree/master/activity/counter',
  'inputs': [
    {
      'name': 'counterName',
      'type': 'string',
      'required': true
    },
    {
      'name': 'increment',
      'type': 'boolean'
    },
    {
      'name': 'reset',
      'type': 'boolean'
    }
  ],
  'outputs': [
    {
      'name': 'value',
      'type': 'integer'
    }
  ]
};

describe('Service: FlogoMicroserviceTaskIdGeneratorService', function (this: {
  testService: AbstractTaskIdGenerator
}) {
  beforeAll(() => {
    this.testService = new FlogoMicroserviceTaskIdGeneratorService();
  });

  it('Should generate the task ID for Microservice profile in "ref_num" format', () => {
    expect(this.testService.generateTaskID(mockTasksAvailable, mockSelectedTask)).toEqual('counter_2');
  });
});

describe('Service: FlogoDeviceTaskIdGeneratorService', function (this: {
  testService: AbstractTaskIdGenerator
}) {
  beforeAll(() => {
    this.testService = new FlogoDeviceTaskIdGeneratorService();
  });

  it('Should generate the task ID for Microservice profile in "num" format', () => {
    expect(this.testService.generateTaskID(mockTasksAvailable)).toEqual('2');
  });
});
