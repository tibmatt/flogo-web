import { Dictionary, GraphNode, NodeType } from '@flogo/core';
import { ObjectSlice } from '@flogo/core/testing';
import { makeGraph } from './graph-creator';

import arrayContaining = jasmine.arrayContaining;
import objectContaining = jasmine.objectContaining;

describe('flow.core.models.graphCreator', function () {
  const tasks = [
    {
      'id': 'log_1',
      'name': 'Start processing',
      'description': 'Simple Log Activity',
      'type': 1,
      'activityType': 'github-com-tibco-software-flogo-contrib-activity-log',
      'activityRef': 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
      'attributes': [
        {
          'name': 'message',
          'value': 'Received Rest request and starting trigger',
          'required': false,
          'type': 'string'
        },
        {
          'name': 'flowInfo',
          'value': 'true',
          'required': false,
          'type': 'boolean'
        },
        {
          'name': 'addToFlow',
          'value': 'true',
          'required': false,
          'type': 'boolean'
        }
      ]
    },
    {
      'id': 'awsiot_1',
      'name': 'Update',
      'description': 'Simple AWS IoT',
      'type': 1,
      'activityType': 'github-com-tibco-software-flogo-contrib-activity-awsiot',
      'activityRef': 'github.com/TIBCOSoftware/flogo-contrib/activity/awsiot',
      'attributes': [
        {
          'name': 'thingName',
          'value': 'flogo_test',
          'required': false,
          'type': 'string'
        },
        {
          'name': 'awsEndpoint',
          'value': 'a1njsonnibpa75.iot.us-east-1.amazonaws.com',
          'required': false,
          'type': 'string'
        },
        {
          'name': 'desired',
          'value': {
            'switch': 'on'
          },
          'required': false,
          'type': 'params'
        },
        {
          'name': 'reported',
          'value': {
            'switch': 'off'
          },
          'required': false,
          'type': 'params'
        }
      ]
    },
    {
      'id': 'reply_1',
      'name': 'Done',
      'description': 'Simple Reply Activity',
      'type': 1,
      'activityType': 'github-com-tibco-software-flogo-contrib-activity-reply',
      'activityRef': 'github.com/TIBCOSoftware/flogo-contrib/activity/reply',
      'attributes': [
        {
          'name': 'code',
          'value': '200',
          'required': false,
          'type': 'integer'
        },
        {
          'name': 'data',
          'value': 'AWS IOT update successfully',
          'required': false,
          'type': 'any'
        }
      ]
    },
    {
      'id': 'log_6',
      'name': 'Log Message (3)',
      'description': 'Simple Log Activity',
      'type': 1,
      'activityType': 'tibco-log',
      'activityRef': 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
      'attributes': [
        {
          'name': 'message',
          'value': '',
          'required': false,
          'type': 'string'
        },
        {
          'name': 'flowInfo',
          'value': 'false',
          'required': false,
          'type': 'boolean'
        },
        {
          'name': 'addToFlow',
          'value': 'false',
          'required': false,
          'type': 'boolean'
        }
      ]
    },
    {
      'id': 'log_7',
      'name': 'Log Message (4)',
      'description': 'Simple Log Activity',
      'type': 1,
      'activityType': 'tibco-log',
      'activityRef': 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
      'attributes': [
        {
          'name': 'message',
          'value': '',
          'required': false,
          'type': 'string'
        },
        {
          'name': 'flowInfo',
          'value': 'false',
          'required': false,
          'type': 'boolean'
        },
        {
          'name': 'addToFlow',
          'value': 'false',
          'required': false,
          'type': 'boolean'
        }
      ]
    },
    {
      'id': 'log_4',
      'name': 'Log Message',
      'description': 'Simple Log Activity',
      'type': 1,
      'activityType': 'tibco-log',
      'activityRef': 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
      'attributes': [
        {
          'name': 'message',
          'value': '',
          'required': false,
          'type': 'string'
        },
        {
          'name': 'flowInfo',
          'value': 'false',
          'required': false,
          'type': 'boolean'
        },
        {
          'name': 'addToFlow',
          'value': 'false',
          'required': false,
          'type': 'boolean'
        }
      ]
    },
    {
      'id': 'log_5',
      'name': 'Log Message (2)',
      'description': 'Simple Log Activity',
      'type': 1,
      'activityType': 'tibco-log',
      'activityRef': 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
      'attributes': [
        {
          'name': 'message',
          'value': '',
          'required': false,
          'type': 'string'
        },
        {
          'name': 'flowInfo',
          'value': 'false',
          'required': false,
          'type': 'boolean'
        },
        {
          'name': 'addToFlow',
          'value': 'false',
          'required': false,
          'type': 'boolean'
        }
      ]
    }
  ];
  const links = [
    {
      'id': 1,
      'from': 'log_1',
      'to': 'awsiot_1',
      'type': 0
    },
    {
      'id': 2,
      'from': 'awsiot_1',
      'to': 'reply_1',
      'type': 0
    },
    {
      'id': 3,
      'from': 'reply_1',
      'to': 'log_6',
      'type': 1,
      'value': 'true'
    },
    {
      'id': 4,
      'from': 'log_6',
      'to': 'log_7',
      'type': 1,
      'value': 'true'
    },
    {
      'id': 5,
      'from': 'awsiot_1',
      'to': 'log_4',
      'type': 1,
      'value': 'true'
    },
    {
      'id': 6,
      'from': 'awsiot_1',
      'to': 'log_5',
      'type': 1,
      'value': 'true'
    }
  ];

  it('should create a graph from the flow info', function () {
    const graph = makeGraph(tasks, links, {});
    expect(graph.rootId).toEqual('log_1');
    expect(graph.nodes.awsiot_1.children.length).toEqual(3);
    expect(graph.nodes.reply_1.children.length).toEqual(1);

    type NodeSlice = ObjectSlice<GraphNode>;
    type PartialNodeDict = Dictionary<NodeSlice | jasmine.ObjectContaining<NodeSlice>>;

    expect<PartialNodeDict>(graph.nodes).toEqual(objectContaining<PartialNodeDict>({
      log_1: objectContaining({
        title: 'Start processing',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_1',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        },
        children: ['awsiot_1'],
        parents: []
      }),
      awsiot_1: objectContaining({
        title: 'Update',
        description: 'Simple AWS IoT',
        type: NodeType.Task,
        id: 'awsiot_1',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        },
        children: <string[]><any> arrayContaining(['reply_1']),
        parents: ['log_1']
      }),
      reply_1: objectContaining({
        title: 'Done',
        description: 'Simple Reply Activity',
        type: NodeType.Task,
        id: 'reply_1',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        },
        parents: ['awsiot_1']
      }),
      log_6: objectContaining({
        title: 'Log Message (3)',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_6',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        },
      }),
      log_7: objectContaining({
        title: 'Log Message (4)',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_7',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        },
        children: [],
      }),
      log_4: objectContaining({
        title: 'Log Message',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_4',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        },
        children: [],
      }),
      log_5: objectContaining({
        title: 'Log Message (2)',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_5',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        },
        children: [],
      }),
    }));

    const branchNodes = Object.values(graph.nodes).filter(node => node.type === NodeType.Branch);
    expect<NodeSlice[]>(branchNodes).toEqual(<any>jasmine.arrayWithExactContents([
      objectContaining({
        type: NodeType.Branch,
        parents: ['reply_1'],
        children: ['log_6'],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        }
      }),
      objectContaining({
        type: NodeType.Branch,
        parents: ['log_6'],
        children: ['log_7'],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        }
      }),
      objectContaining({
        type: NodeType.Branch,
        parents: ['awsiot_1'],
        children: ['log_4'],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        }
      }),
      objectContaining({
        type: NodeType.Branch,
        parents: ['awsiot_1'],
        children: ['log_5'],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false
        }
      })
    ]));
  });
});
