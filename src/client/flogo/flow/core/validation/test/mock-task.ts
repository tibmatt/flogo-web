import { FLOGO_TASK_TYPE, ItemActivityTask } from '@flogo/core';

export function mockActivityTask(partialItem: Partial<ItemActivityTask>): ItemActivityTask {
  return {
    id: 'some_id',
    name: 'test task',
    ref: 'some/test/ref',
    type: FLOGO_TASK_TYPE.TASK,
    ...partialItem,
    input: partialItem.input || {},
  };
}
