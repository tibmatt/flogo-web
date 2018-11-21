import isEmpty from 'lodash/isEmpty';
import { formatLinks } from './format-links';
import { formatTasks } from './format-tasks';

export function formatTaskLinkGroups(activitySchemas, flow) {
  const rootTask = {
    tasks: flow.tasks,
    links: flow.links
  };
  const errorHandler = flow.errorHandler || {};
  return {
    root: formatGroup(activitySchemas, rootTask),
    error: formatGroup(activitySchemas, errorHandler),
  };
}

function formatGroup(activitySchemas, { tasks, links }) {
  const group = {};
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
