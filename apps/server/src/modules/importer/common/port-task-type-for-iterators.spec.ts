import { portTaskTypeForIterators } from './port-task-type-for-iterators';

describe('importer.common.portTaskTypeForIterators', () => {
  const testData = {
    'normalTask': {
      'ref': 'some/activity',
      'settings': {},
      'type': 1,
    },
    'subflowTask': {
      'ref': 'some/activity',
      'settings': {
        'flowPath': 'path/to/some/flow'
      },
      'type': 4
    },
    'iterableTask': {
      'ref': 'some/activity',
      'settings': {
        'iterate': '10'
      },
      'type': 2
    },
    'subFlowIterableTask': {
      'ref': 'some/activity',
      'settings': {
        'flowPath': 'path/to/some/flow',
        'iterate': '10'
      },
      'type': 4
    }
  };

  const getTaskTypeAfterPorting = (task) => portTaskTypeForIterators(task).type;

  it('should not change the task type for a normal task', () => {
    expect(getTaskTypeAfterPorting(testData.normalTask)).toEqual(1);
  });

  it('should not change the task type for a subflow task', () => {
    expect(getTaskTypeAfterPorting(testData.subflowTask)).toEqual(4);
  });

  it('should change the task type for an iterable task', () => {
    expect(getTaskTypeAfterPorting(testData.iterableTask)).toEqual(1);
  });

  it('should not change the task type for a normal task', () => {
    expect(getTaskTypeAfterPorting(testData.subFlowIterableTask)).toEqual(4);
  });
});
