import { isEmpty } from 'lodash';
import { ResourceActionModel, FlowData } from '@flogo-web/core';
import { formatLinks } from './format-links';
import { formatTasks } from './format-tasks';

export interface TaskLinkGroup {
  tasks?: ResourceActionModel.Task[];
  links?: ResourceActionModel.Link[];
}

export function formatTaskLinkGroups(
  activitySchemas,
  flow: Partial<FlowData>
): { root: TaskLinkGroup; error: TaskLinkGroup } {
  const rootTask = {
    tasks: flow.tasks,
    links: flow.links,
  };
  const errorHandler = flow.errorHandler || {};
  return {
    root: formatGroup(activitySchemas, rootTask),
    error: formatGroup(activitySchemas, errorHandler),
  };
}

function formatGroup(activitySchemas, { tasks, links }: { tasks?; links? }) {
  const group: { tasks?: any[]; links?: any[] } = {};
  const formattedTasks = formatTasks(activitySchemas, tasks);
  if (!isEmpty(formattedTasks)) {
    group.tasks = formattedTasks;
  }
  const formattedLinks = formatLinks(links);
  if (!isEmpty(formattedLinks)) {
    group.links = formattedLinks;
  }
  return group;
}
