import isEmpty from 'lodash/isEmpty';
import { formatLinks } from './format-links';
import { formatTasks } from './format-tasks';

export function formatTaskLinkGroups(activitySchemas, flow) {
  return {
    root: formatGroup(activitySchemas, flow.rootTask || {}),
    error: formatGroup(activitySchemas, flow.errorHandlerTask || {}),
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
