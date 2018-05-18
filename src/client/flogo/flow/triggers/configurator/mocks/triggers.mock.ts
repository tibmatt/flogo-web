import {ValueType} from '@flogo/core';

export const TriggersMock = [
  {
    id: 'trigger_1',
    isValid: true,
    isDirty: false,
    name: 'Receive HTTP Message'
  }, {
    id: 'trigger_2',
    isValid: true,
    isDirty: false,
    name: 'Receive HTTP Message (1) (1)'
  }
];

export const FlowMetaDataMock = {
  'input': [
    {
      'name': 'in',
      'type': ValueType.String,
      'value': 'test'
    },
    {
      'name': 'in2',
      'type': ValueType.String
    }
  ],
  'output': []
};
