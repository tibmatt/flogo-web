export let resultantFlowModelForCanvas = {
  'triggers': [
    {
      'id': 'trigger_request',
      'name': 'Trigger Request',
      'ref': 'github.com/TIBCOSoftware/flogo-contrib/trigger/timer',
      'settings': {},
      'handlers': [
        {
          'settings': {
            'repeating': null,
            'startDate': null,
            'hours': null,
            'minutes': '5',
            'seconds': null
          },
          'actionId': 'test_flow_1'
        }
      ]
    }
  ]
};
