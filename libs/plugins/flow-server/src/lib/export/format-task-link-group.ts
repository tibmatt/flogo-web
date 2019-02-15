import { isEmpty } from 'lodash';
import { ResourceActionModel, FlowData, ContributionSchema } from '@flogo-web/core';
import { formatLinks } from './format-links';
import { formatTasks } from './format-tasks';

export interface TaskLinkGroup {
  tasks?: ResourceActionModel.Task[];
  links?: ResourceActionModel.Link[];
}

export interface Context {
  contributions: Map<string, ContributionSchema>;
  resourceIdReconciler: Map<string, string>;
}

export function formatTaskLinkGroups(
  flow: Partial<FlowData>,
  context: Context
): { root: TaskLinkGroup; error: TaskLinkGroup } {
  const rootTask = {
    tasks: flow.tasks,
    links: flow.links,
  };
  const errorHandler = flow.errorHandler || {};
  return {
    root: formatGroup(context, rootTask),
    error: formatGroup(context, errorHandler),
  };
}

function formatGroup(
  { contributions, resourceIdReconciler }: Context,
  { tasks, links }: { tasks?; links? }
) {
  const group: { tasks?: any[]; links?: any[] } = {};
  const formattedTasks = formatTasks(tasks, contributions, resourceIdReconciler);
  if (!isEmpty(formattedTasks)) {
    group.tasks = formattedTasks;
  }
  const formattedLinks = formatLinks(links);
  if (!isEmpty(formattedLinks)) {
    group.links = formattedLinks;
  }
  return group;
}
