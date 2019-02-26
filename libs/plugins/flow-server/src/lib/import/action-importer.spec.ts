import { Resource } from '@flogo-web/core';
import { createActionImporter } from './create-action-importer';
import { REF_SUBFLOW } from '@flogo-web/server/core';

test('It imports an action', () => {
  const actionImporter = createActionImporter();
  const flowResource = getSampleFlowResource();
  const importedFlow = actionImporter.importAction(flowResource, {
    contributions: getContributions(),
    normalizedTriggerIds: new Map(),
    normalizedResourceIds: new Map([['flow:somesubflow', 'updatedSubflowId']]),
  });
  expect(importedFlow).toEqual(expect.objectContaining(getExpectedImport()));
});

test('It errors if an activity is not installed', () => {
  const actionImporter = createActionImporter();
  const flowResource = getSampleFlowResource();
  expect.assertions(1);
  try {
    actionImporter.importAction(flowResource, {
      contributions: new Map<string, any>([[REF_SUBFLOW, {}]]),
      normalizedTriggerIds: new Map(),
      normalizedResourceIds: new Map(),
    });
  } catch (e) {
    expect(e).toMatchObject({
      details: {
        errors: [
          {
            keyword: 'activity-installed',
            dataPath: '.data.tasks[0].activity.ref',
          },
          {
            keyword: 'activity-installed',
            dataPath: '.data.tasks[1].activity.ref',
          },
          {
            keyword: 'activity-installed',
            dataPath: '.data.errorHandler.tasks[0].activity.ref',
          },
        ],
      },
    });
  }
});

function getSampleFlowResource(): Resource {
  return {
    id: 'generatedId',
    name: 'GetStatus',
    description: 'A description',
    type: 'flow',
    metadata: {
      input: [
        {
          name: 'id',
          type: 'string',
        },
      ],
      output: [
        {
          name: 'status',
          type: 'object',
        },
        {
          name: 'code',
          type: 'integer',
        },
      ],
    },
    data: {
      tasks: [
        {
          id: 'log_1',
          name: 'Log Message',
          description: 'Simple Log Activity',
          activity: {
            ref: 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
            input: {},
            mappings: {
              input: [
                {
                  type: 'literal',
                  value: 'hello',
                  mapTo: 'message',
                },
              ],
            },
          },
        },
        {
          id: 'log_2',
          name: 'Log Message 2',
          description: 'Simple Log Activity 2',
          activity: {
            ref: 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
            input: {},
            mappings: {
              input: [
                {
                  type: 'literal',
                  value: 'world',
                  mapTo: 'message',
                },
              ],
            },
          },
        },
        {
          id: 'subflow_1',
          name: 'Subflow',
          activity: {
            ref: REF_SUBFLOW,
            settings: {
              flowURI: 'res://flow:somesubflow',
            },
          },
        },
      ],
      links: [{ from: 'log_1', to: 'log_2' }],
      errorHandler: {
        tasks: [
          {
            id: 'log_6',
            activity: {
              ref: 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
              input: {
                message: 'log in error handler',
              },
              output: {},
              mappings: {},
            },
          },
        ],
      },
    },
  };
}

function getExpectedImport() {
  return {
    id: 'generatedId',
    name: 'GetStatus',
    description: 'A description',
    type: 'flow',
    metadata: {
      input: [
        {
          name: 'id',
          type: 'string',
        },
      ],
      output: [
        {
          name: 'status',
          type: 'object',
        },
        {
          name: 'code',
          type: 'integer',
        },
      ],
    },
    data: {
      tasks: [
        {
          id: 'log_1',
          name: 'Log Message',
          description: 'Simple Log Activity',
          type: 1,
          activityRef: 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
          settings: {},
          inputMappings: {
            message: 'hello',
          },
        },
        {
          id: 'log_2',
          name: 'Log Message 2',
          description: 'Simple Log Activity 2',
          type: 1,
          activityRef: 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
          settings: {},
          inputMappings: {
            message: 'world',
          },
        },
        {
          id: 'subflow_1',
          type: 4,
          name: 'Subflow',
          description: '',
          activityRef: REF_SUBFLOW,
          inputMappings: {},
          settings: {
            flowPath: 'updatedSubflowId',
          },
        },
      ],
      links: [
        {
          id: 0,
          from: 'log_1',
          to: 'log_2',
          type: 0,
        },
      ],
      errorHandler: {
        tasks: [
          {
            id: 'log_6',
            name: 'log_6',
            description: '',
            type: 1,
            activityRef: 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
            settings: {},
            inputMappings: {
              message: 'log in error handler',
            },
          },
        ],
        links: [],
      },
    },
  };
}

function getContributions() {
  return new Map<string, any>([
    [
      'github.com/TIBCOSoftware/flogo-contrib/activity/log',
      {
        name: 'tibco-log',
        type: 'flogo:activity',
        ref: 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
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
            name: 'flowInfo',
            type: 'boolean',
            value: false,
          },
          {
            name: 'addToFlow',
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
    [REF_SUBFLOW, { ref: REF_SUBFLOW }],
  ]);
}
