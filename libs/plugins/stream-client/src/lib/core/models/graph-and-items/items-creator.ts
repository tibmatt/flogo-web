import { fromPairs } from 'lodash';
import { ActivitySchema } from '@flogo-web/core';

import { ItemFactory } from './item-factory';

export function makeTaskItems(
  tasks,
  getActivitySchema: (task) => Partial<ActivitySchema>
) {
  return fromPairs(
    tasks.map(task => [task.id, makeTaskItem(task, getActivitySchema(task))])
  );
}

export function makeBranchItem(id: string, link) {
  return ItemFactory.makeBranch({ taskID: id, condition: link.value });
}

export function makeTaskItem(task, schema: Partial<ActivitySchema>) {
  return ItemFactory.makeItem({ taskInstance: task, activitySchema: schema });
}
