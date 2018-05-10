import {ValueType} from '@flogo/core';

export const TriggersMock = [
  {
    'trigger': {
      'name': 'Receive HTTP Message',
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
      'description': 'Simple REST Trigger',
      'settings': {
        'port': '8081'
      },
      'id': 'trigger_1',
      'createdAt': 'datetime',
      'updatedAt': 'datetime',
      'handlers': [
        {
          'actionMappings': {
            'input': [
              {
                'mapTo': 'in',
                'type': 2,
                'value': 200
              },
              {
                'mapTo': 'in2',
                'type': 2,
                'value': 56565656
              }
            ],
            'output': []
          },
          'settings': {
            'method': null,
            'path': null
          },
          'outputs': {
            'params': null,
            'pathParams': null,
            'queryParams': null,
            'header': null,
            'content': null
          },
          'actionId': 'action_1',
          'createdAt': 'datetime',
          'updatedAt': 'datetime'
        }
      ],
      'appId': 'app_1',
      'handler': {
        'actionMappings': {
          'input': [
            {
              'mapTo': 'in',
              'type': 2,
              'value': 200
            },
            {
              'mapTo': 'in2',
              'type': 2,
              'value': 56565656
            }
          ],
          'output': []
        },
        'settings': {
          'method': null,
          'path': null
        },
        'outputs': {
          'params': null,
          'pathParams': null,
          'queryParams': null,
          'header': null,
          'content': null
        },
        'actionId': 'action_1',
        'createdAt': 'datetime',
        'updatedAt': 'datetime'
      }
    },
    'handler': {
      'actionMappings': {
        'input': [
          {
            'mapTo': 'in',
            'type': 2,
            'value': 200
          },
          {
            'mapTo': 'in2',
            'type': 2,
            'value': 56565656
          }
        ],
        'output': []
      },
      'settings': {
        'method': null,
        'path': null
      },
      'outputs': {
        'params': null,
        'pathParams': null,
        'queryParams': null,
        'header': null,
        'content': null
      },
      'actionId': 'action_1',
      'createdAt': 'datetime',
      'updatedAt': 'datetime'
    },
    'triggerSchema': {
      'name': 'Receive HTTP Message',
      'version': '0.0.1',
      'homepage': 'https://github.com/TIBCOSoftware/flogo-contrib/tree/master/trigger/rest',
      'description': 'Simple REST Trigger',
      'installed': true,
      'settings': [
        {
          'name': 'port',
          'type': 'integer',
          'required': true,
          'value': '8081'
        }
      ],
      'outputs': [
        {
          'name': 'params',
          'type': 'params'
        },
        {
          'name': 'pathParams',
          'type': 'params'
        },
        {
          'name': 'queryParams',
          'type': 'params'
        },
        {
          'name': 'header',
          'type': 'params'
        },
        {
          'name': 'content',
          'type': 'any'
        }
      ],
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
      'endpoint': {
        'settings': [
          {
            'name': 'method',
            'type': 'string',
            'required': true,
            'allowed': [
              'GET',
              'POST',
              'PUT',
              'PATCH',
              'DELETE'
            ]
          },
          {
            'name': 'path',
            'type': 'string',
            'required': true
          }
        ]
      },
      '__props': {
        'errors': []
      },
      '__status': {},
      'id': 'trigger_1',
      'nodeId': 'trigger_node_1',
      'type': 0,
      'triggerType': 'flogo-rest',
      'reply': [
        {
          'name': 'code',
          'type': 'integer'
        },
        {
          'name': 'data',
          'type': 'any'
        }
      ]
    }
  },
  {
    'trigger': {
      'name': 'Receive HTTP Message (1) (1)',
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
      'description': 'Simple REST Trigger',
      'settings': {
        'port': '8080'
      },
      'id': 'trigger_2',
      'createdAt': 'datetime',
      'updatedAt': 'datetime',
      'handlers': [
        {
          'actionMappings': {
            'input': [
              {
                'mapTo': 'in',
                'type': 2,
                'value': 20
              }
            ],
            'output': []
          },
          'settings': {
            'method': 'GET',
            'path': '/testing'
          },
          'outputs': {
            'params': null,
            'pathParams': null,
            'queryParams': null,
            'header': null,
            'content': null
          },
          'actionId': 'action_1',
          'createdAt': 'datetime',
          'updatedAt': 'datetime'
        }
      ],
      'appId': 'app_1',
      'handler': {
        'actionMappings': {
          'input': [
            {
              'mapTo': 'in',
              'type': 2,
              'value': 20
            }
          ],
          'output': []
        },
        'settings': {
          'method': 'GET',
          'path': '/testing'
        },
        'outputs': {
          'params': null,
          'pathParams': null,
          'queryParams': null,
          'header': null,
          'content': null
        },
        'actionId': 'action_1',
        'createdAt': 'datetime',
        'updatedAt': 'datetime'
      }
    },
    'handler': {
      'actionMappings': {
        'input': [
          {
            'mapTo': 'in',
            'type': 2,
            'value': 20
          }
        ],
        'output': []
      },
      'settings': {
        'method': 'GET',
        'path': '/testing'
      },
      'outputs': {
        'params': null,
        'pathParams': null,
        'queryParams': null,
        'header': null,
        'content': null
      },
      'actionId': 'action_1',
      'createdAt': 'datetime',
      'updatedAt': 'datetime'
    },
    'triggerSchema': {
      'name': 'Receive HTTP Message (1) (1)',
      'version': '0.0.1',
      'homepage': 'https://github.com/TIBCOSoftware/flogo-contrib/tree/master/trigger/rest',
      'description': 'Simple REST Trigger',
      'installed': true,
      'settings': [
        {
          'name': 'port',
          'type': 'integer',
          'required': true,
          'value': '8080'
        }
      ],
      'outputs': [
        {
          'name': 'params',
          'type': 'params'
        },
        {
          'name': 'pathParams',
          'type': 'params'
        },
        {
          'name': 'queryParams',
          'type': 'params'
        },
        {
          'name': 'header',
          'type': 'params'
        },
        {
          'name': 'content',
          'type': 'any'
        }
      ],
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
      'endpoint': {
        'settings': [
          {
            'name': 'method',
            'type': 'string',
            'required': true,
            'allowed': [
              'GET',
              'POST',
              'PUT',
              'PATCH',
              'DELETE'
            ],
            'value': 'GET'
          },
          {
            'name': 'path',
            'type': 'string',
            'required': true,
            'value': '/testing'
          }
        ]
      },
      '__props': {
        'errors': []
      },
      '__status': {},
      'id': 'trigger_2',
      'nodeId': 'trigger_node_1',
      'type': 0,
      'triggerType': 'flogo-rest',
      'reply': [
        {
          'name': 'code',
          'type': 'integer'
        },
        {
          'name': 'data',
          'type': 'any'
        }
      ]
    }
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
