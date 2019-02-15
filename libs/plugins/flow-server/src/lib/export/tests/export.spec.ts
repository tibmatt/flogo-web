import {
  Resource,
  FlowData,
  ContributionSchema,
  FlogoAppModel,
  ResourceActionModel,
} from '@flogo-web/core';
import { FLOGO_TASK_TYPE } from '@flogo-web/server/core';
import { exportFlow } from '..';

test('it exports a flow', () => {
  const exported = exportFlow(getFlowToExport(), {
    contributions: new Map<string, ContributionSchema>(getContributions()),
    resourceIdReconciler: new Map<string, string>([['4ut01d', 'humanized_subflow_ref']]),
  });
  expect(exported).toEqual(getExpectedFlow());
});

function getExpectedFlow(): FlogoAppModel.Resource<ResourceActionModel.FlowResourceData> {
  return {
    id: 'flow:flow_to_export',
    data: {
      name: 'flow to export',
      description: 'some description',
      metadata: {
        input: [{ name: 'in1', type: 'string' }],
        output: [{ name: 'out1', type: 'string' }],
      },
      tasks: [
        {
          id: 'log_2',
          name: 'Log',
          description: 'Logs a message',
          activity: {
            ref: 'github.com/project-flogo/contrib/activity/log',
            input: {
              message: 'hello world',
              addDetails: false,
            },
          },
        },
        {
          id: 'subflow_3',
          name: 'Start a SubFlow',
          description: 'Activity to start a sub-flow in an existing flow',
          activity: {
            ref: 'github.com/TIBCOSoftware/flogo-contrib/activity/subflow',
            settings: {
              flowURI: 'res://flow:humanized_subflow_ref',
            },
          },
        },
      ],
      links: [
        {
          from: 'log_2',
          to: 'subflow_3',
        },
      ],
      errorHandler: {
        tasks: [
          {
            id: 'error_log',
            name: 'Log',
            description: 'Logs a message',
            activity: {
              ref: 'github.com/project-flogo/contrib/activity/log',
              input: {
                message: 'hello world from the error handler',
                addDetails: true,
              },
            },
          },
        ],
      },
    },
  };
}

function getFlowToExport(): Resource<FlowData> {
  return {
    id: 'flow_to_export',
    name: 'flow to export',
    description: 'some description',
    createdAt: '2018-10-05T14:48:00.000Z',
    updatedAt: '2018-10-05T14:48:00.000Z',
    metadata: {
      input: [{ name: 'in1', type: 'string', value: null }],
      output: [{ name: 'out1', type: 'string', value: null }],
    },
    type: 'flow',
    data: {
      tasks: [
        {
          id: 'log_2',
          name: 'Log',
          description: 'Logs a message',
          type: 1,
          activityRef: 'github.com/project-flogo/contrib/activity/log',
          inputMappings: {
            message: 'hello world',
            addDetails: false,
          },
        },
        {
          id: 'subflow_3',
          name: 'Start a SubFlow',
          description: 'Activity to start a sub-flow in an existing flow',
          type: FLOGO_TASK_TYPE.TASK_SUB_PROC,
          activityRef: 'github.com/TIBCOSoftware/flogo-web/activity/subflow',
          settings: {
            flowPath: '4ut01d',
          },
        },
      ],
      links: [{ id: '1', from: 'log_2', to: 'subflow_3' }],
      errorHandler: {
        tasks: [
          {
            id: 'error_log',
            name: 'Log',
            description: 'Logs a message',
            type: 1,
            activityRef: 'github.com/project-flogo/contrib/activity/log',
            inputMappings: {
              message: 'hello world from the error handler',
              addDetails: true,
            },
          },
        ],
      },
    },
  };
}

function getContributions(): Array<[string, ContributionSchema]> {
  return [
    [
      'github-com-tibco-software-flogo-contrib-tibco-log',
      {
        name: 'tibco-log',
        type: 'flogo:activity',
        ref: 'github.com/project-flogo/contrib/activity/log',
        version: '0.0.1',
        title: 'Log Message',
        description: 'Simple Log Activity',
        homepage:
          'https://github.com/TIBCOSoftware/flogo-contrib/tree/master/activity/log',
        input: [
          {
            name: 'message',
            type: 'string',
            value: '',
          },
          {
            name: 'addDetails',
            type: 'boolean',
            value: false,
          },
        ],
        output: [
          {
            name: 'message',
            type: 'string',
          },
        ],
      },
    ],
  ];
}
