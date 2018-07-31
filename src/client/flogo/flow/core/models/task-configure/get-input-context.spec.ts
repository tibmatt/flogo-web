import {FlowState, INITIAL_STATE} from '@flogo/flow/core/state';
import {getPrecedingTasksForErrorHandler} from '@flogo/flow/core/models/task-configure/get-input-context';
import {NodeType} from '@flogo/core';
import {FLOGO_TASK_TYPE} from '@flogo/core/constants';

describe('taskConfigure.getInputContext', function () {
  let state: FlowState;
  let expectedResult: any[];

  beforeEach(function () {
    state = {
      ...INITIAL_STATE,
      mainItems: {
        log_2: {
          name: 'Log Message',
          description: 'Simple Log Activity',
          settings: {},
          ref: 'logRef',
          id: 'log_2',
          type: 1,
          inputMappings: []

        }
      },
      mainGraph: {
        rootId: 'log_2',
        nodes: {
          log_2: {
            type: NodeType.Task,
            id: 'log_2',
            features: {},
            status: {},
            children: [],
            parents: []
          }
        }
      },
      errorItems: {
        log_3: {
          name: 'Log Message (2)',
          description: 'Simple Log Activity',
          settings: {},
          ref: 'logRef',
          id: 'log_3',
          type: 1,
          inputMappings: []


        }
      },
      errorGraph: {
        rootId: 'log_3',
        nodes: {
          log_3: {
            type: NodeType.Task,
            id: 'log_3',
            children: [],
            parents: [],
            features: {},
            status: {}
          }
        }
      },
      isErrorPanelOpen: true,
      schemas: {
        logRef: {
          ref: 'logRef',
          homepage: 'logHome',
          name: 'tibco-log',
          title: 'Log Message',
          type: 'flogo:activity',
          description: 'Simple Log Activity',
          return: false,
          version: '0.0.1',
          inputs: [],
          outputs: []
        }
      },
    };

    expectedResult = [{
      id: 'log_2',
      type: FLOGO_TASK_TYPE.TASK,
      version: '0.0.1',
      name: 'Log Message',
      activityRef: 'logRef',
      ref: 'logRef',
      description: 'Simple Log Activity',
      attributes: {
        inputs: [],
        outputs: []
      },
      inputMappings: [],
      settings: {},
      __props: {},
      __status: {}
    }, {
      id: '',
      name: 'On Error',
      type: FLOGO_TASK_TYPE.TASK_ROOT,
      triggerType: '__error-trigger',
      attributes: {
        outputs: [{
          name: 'activity',
          type: 'string',
          title: 'activity',
          value: ''
        }, {
          name: 'message',
          type: 'string',
          title: 'message',
          value: ''
        }, {
          name: 'data',
          type: 'any',
          title: 'data',
          value: ''
        }, {
          name: 'code',
          type: 'string',
          title: 'code',
          value: ''
        }]
      }
    }];
  });

  it('should get preceding tasks for Error Handler while configuring', function () {
    const taskId = 'log_3';
    const result = getPrecedingTasksForErrorHandler(taskId, state);
    expectedResult.forEach((expectedRow, rowIndex) => {
      const actualRow = result[rowIndex];
      expect(actualRow.type).toEqual(expectedRow.type);
    });
    expect(result).toEqual(expectedResult);
  });

});
