import { ContributionSchema, CONTRIB_REFS, Resource } from '@flogo-web/core';
import { isSubflowTask, AppImportsAgent } from '@flogo-web/lib-server/core';
import { isMapperActivity } from '@flogo-web/plugins/flow-core';
import { TaskFormatter } from './task-formatter';

export function formatTasks(
  tasks = [],
  contributions: Map<string, ContributionSchema>,
  resourceIdReconciler: Map<string, Resource>,
  importsAgent: AppImportsAgent
) {
  const taskFormatter = new TaskFormatter(resourceIdReconciler, importsAgent);
  return tasks.map(task => {
    if (isSubflowTask(task)) {
      task = { ...task, activityRef: CONTRIB_REFS.SUBFLOW };
    }
    const isMapperType = isMapperActivity(contributions.get(task.activityRef));
    return taskFormatter.setSourceTask(task).convert(isMapperType);
  });
}
