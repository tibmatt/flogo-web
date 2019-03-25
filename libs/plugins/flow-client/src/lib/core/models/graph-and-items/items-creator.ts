import { fromPairs } from 'lodash';
import { ActivitySchema, flow as backendFlow } from '@flogo-web/lib-client/core';

import { ItemFactory } from './item-factory';

export function makeTaskItems(
  tasks: backendFlow.Task[],
  getActivitySchema: (task) => Partial<ActivitySchema>
) {
  return fromPairs(
    tasks.map(task => [task.id, makeTaskItem(task, getActivitySchema(task))])
  );
}

export function makeBranchItem(id: string, link: backendFlow.Link) {
  return ItemFactory.makeBranch({ taskID: id, condition: link.value });
}

export function makeTaskItem(task: backendFlow.Task, schema: Partial<ActivitySchema>) {
  return ItemFactory.makeItem({ taskInstance: task, activitySchema: schema });
}
